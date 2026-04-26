!macro NSIS_HOOK_POSTINSTALL
  CreateShortCut "$DESKTOP\Studio Prep.lnk" "$INSTDIR\${MAINBINARYNAME}.exe"
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  Delete "$DESKTOP\Studio Prep.lnk"
!macroend
