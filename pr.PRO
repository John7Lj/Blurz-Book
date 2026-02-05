domains
	list=integer*
	int=integer
predicates
	print(list)
	printNon(list)
	sum(list,int)
	len(list,int)
	search(list,int)
clauses
	%Print Tail Recursion
	print([]):-!.
	print([H|T]):-write(H),nl,print(T).
	%Print Non-Tail Recursion
	printnon([]):-!.
	printnon([H|T]):-printnon(T),write(H),nl.
	%Sum of the list elements
	sum([],C):-write("Sum = ",C),!.
	sum([H|T],C):-R=H+C,sum(T,R).
	%Length of the list
	len([],C):-write("Len = ",C),!.
	len([_|T],C):-R=C+1,len(T,R).
	%Search For an element in a list
	search([X|_],X):-!.
	search([_|T],X):-search(T,X).			

New-Item -Path "filename.txt" -ItemType File
2. Create a file with content
Use the Set-Content cmdlet to write or replace content: 
powershell
Set-Content -Path "filename.txt" -Value "This is the file content."
/