#NoEnv
SendMode Input
SetWorkingDir %A_ScriptDir%

; ---------- Reversed bottom-row number mappings ----------
; / = 0, . = 9, , = 8, m = 7, n = 6, b = 5, v = 4, c = 3, x = 2, z = 1

Tab & /::SendInput zero
Tab & .::SendInput nine
Tab & ,::SendInput eight
Tab & m::SendInput seven
Tab & n::SendInput six
Tab & b::SendInput five
Tab & v::SendInput four
Tab & c::SendInput three
Tab & x::SendInput two
Tab & z::SendInput one

; ---------- Extra mappings ----------
Tab & g::SendInput f
Tab & h::SendInput j

; ---------- Allow normal Tab when pressed alone ----------
Tab::
    KeyWait, Tab, T0.2
    if ErrorLevel
        Return
    Send {Tab}
Return