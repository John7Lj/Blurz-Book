Great question! Adding ebook file uploads involves several decisions. Let me break down your options:

---

## **Storage Options**

### **Option 1: Store files in PostgreSQL (BYTEA column)**
- **Pros:** Everything in one place, simple backup
- **Cons:** Database bloat, slower queries, not ideal for files >1MB
- **Best for:** Small PDFs only (<5MB), simple projects

### **Option 2: Store files on disk, save path in PostgreSQL** ⭐ **RECOMMENDED**
- **Pros:** Fast, scalable, cheap
- **Cons:** Need to manage file cleanup if book deleted
- **Best for:** Your use case — medium-sized project

### **Option 3: Cloud storage (AWS S3, Cloudflare R2, etc.)**
- **Pros:** Unlimited scale, CDN delivery, handles big files
- **Cons:** Costs money, more complex setup
- **Best for:** Production apps with lots of users

---

## **Recommended Approach: Local File Storage + PostgreSQL Path**

Here's how to implement it:

### **1. Database Changes**

Add a `file_path` column to your `Book` model:

```python
# src/db/models.py
class Book(SQLModel, table=True):
    __tablename__ = "Book"
    
    id: uuid.UUID = Field(sa_column=Column(pg.UUID, primary_key=True, nullable=False, default=uuid.uuid4))
    user_id: uuid.UUID | None = Field(default=None, foreign_key="User.id")
    title: str = Field(nullable=False)
    author: str | None = None
    description: str
    page_count: int | None = None
    category: str
    
    # NEW FIELDS FOR EBOOK
    file_path: str | None = None  # Path to the PDF/epub file
    file_size: int | None = None  # Size in bytes
    file_type: str | None = None  # "pdf", "epub", "mobi", etc.
    
    publisher: str | None = None
    published_date: datetime | None = Field(default_factory=datetime.now)
    language: str | None = None
    created_at: datetime | None = Field(default_factory=datetime.now)
    updated_at: datetime | None = Field(default_factory=datetime.now)
    
    user: Optional['User'] = Relationship(back_populates="books")
    reviews: List["Review"] = Relationship(back_populates="book", sa_relationship_kwargs={'lazy':'selectin'})
```

Run migration:
```bash
alembic revision --autogenerate -m "add ebook file fields"
alembic upgrade head
```

---

### **2. Server-Side: File Upload Endpoint**

```python
# src/book/routes.py
from fastapi import UploadFile, File
import os
import shutil
from pathlib import Path

# Create uploads directory
UPLOAD_DIR = Path("uploads/ebooks")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".epub", ".mobi", ".azw", ".azw3"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

@book_router.post('/upload_ebook/{book_id}', dependencies=[checkroler])
async def upload_ebook(
    book_id: str,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    user_data: User = Depends(get_current_user)
):
    # 1. Validate file type
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 2. Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to start
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")
    
    # 3. Get the book and verify ownership
    book = await book_service.get_book(book_id, session)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if str(book.user_id) != str(user_data.id):
        raise HTTPException(status_code=403, detail="Not your book")
    
    # 4. Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # 5. Save file to disk
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # 6. Update book record in DB
    book.file_path = str(file_path)
    book.file_size = file_size
    book.file_type = file_ext.lstrip('.')
    
    await session.commit()
    await session.refresh(book)
    
    return {
        "message": "Ebook uploaded successfully",
        "file_path": str(file_path),
        "file_size": file_size,
        "file_type": file_ext.lstrip('.')
    }
```

---

### **3. Server-Side: Download/Read Endpoint**

```python
# src/book/routes.py
from fastapi.responses import FileResponse

@book_router.get('/download_ebook/{book_id}', dependencies=[checkroler])
async def download_ebook(
    book_id: str,
    session: AsyncSession = Depends(get_session),
    user_data: User = Depends(get_current_user)
):
    book = await book_service.get_book(book_id, session)
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if not book.file_path:
        raise HTTPException(status_code=404, detail="No ebook file uploaded")
    
    if not os.path.exists(book.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    
    # Return file for download
    return FileResponse(
        path=book.file_path,
        filename=f"{book.title}.{book.file_type}",
        media_type="application/octet-stream"
    )
```

---

### **4. Client-Side: Upload Form**

```jsx
// src/components/UploadEbookForm.jsx
import React, { useState } from 'react';
import api from '../services/api';

const UploadEbookForm = ({ bookId, onSuccess, settings }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Client-side validation
    const allowedTypes = ['application/pdf', 'application/epub+zip'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|epub|mobi)$/i)) {
      setError('Only PDF, EPUB, and MOBI files are allowed');
      return;
    }
    
    if (selectedFile.size > maxSize) {
      setError('File is too large (max 50MB)');
      return;
    }
    
    setError('');
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post(`/book/upload_ebook/${bookId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onSuccess(response.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const cardClass = settings.darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className={`${cardClass} rounded-xl shadow-lg p-6`}>
      <h3 className={`text-xl font-bold ${textClass} mb-4`}>Upload Ebook File</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
      
      <input
        type="file"
        accept=".pdf,.epub,.mobi"
        onChange={handleFileChange}
        className="mb-4 w-full"
        disabled={uploading}
      />
      
      {file && (
        <div className={`mb-4 ${textClass}`}>
          <p>Selected: {file.name}</p>
          <p className="text-sm opacity-70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload Ebook'}
      </button>
    </div>
  );
};

export default UploadEbookForm;
```

---

### **5. Do You Need Background Processing?**

**For basic upload/download: NO**

But you might want Celery for:
- **PDF thumbnail generation** (extract first page as preview image)
- **Text extraction** (for search functionality)
- **Format conversion** (EPUB → PDF, etc.)
- **Virus scanning** (optional security)

Example Celery task for thumbnail:

```python
# src/celery/celery_tasks.py
from pdf2image import convert_from_path

@app.task()
def generate_pdf_thumbnail(book_id: str, file_path: str):
    try:
        images = convert_from_path(file_path, first_page=1, last_page=1)
        thumbnail_path = file_path.replace('.pdf', '_thumb.jpg')
        images[0].save(thumbnail_path, 'JPEG')
        
        # Update book with thumbnail path
        # ... database update code here
        
        return thumbnail_path
    except Exception as e:
        print(f"Thumbnail generation failed: {e}")
```

---

### **Summary**

✅ **Store files:** On disk in `uploads/ebooks/`  
✅ **Store path:** In PostgreSQL `file_path` column  
✅ **Upload:** FastAPI with `UploadFile`  
✅ **Download:** `FileResponse`  
✅ **Client:** `FormData` with `multipart/form-data`  
❌ **Background processing:** Not required for basic upload/download (but nice for thumbnails)

PostgreSQL works perfectly for this — you're just storing the file path as a string, not the actual file bytes.