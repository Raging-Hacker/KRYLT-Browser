; Branded assisted installer. Browser registration offers a choice in Windows;
; it never writes UserChoice or changes the user's current default.
!include nsDialogs.nsh
!include MUI2.nsh

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to KRYLT"
  !define MUI_WELCOMEPAGE_TEXT "Modern browsing. Your way.$\r$\n$\r$\nFrom Cyclonix Designs.$\r$\n$\r$\nKeep your favourite web apps close, personalise your workspace and take control of everyday browsing.$\r$\n$\r$\nSetup will install KRYLT on this PC. You can choose the installation folder on the next page."
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customPageAfterChangeDir
  Page custom KryltBenefits
!macroend

!macro customHeader
!ifndef BUILD_UNINSTALLER
Function KryltBenefits
  !insertmacro MUI_HEADER_TEXT "A better fit for modern browsing" "KRYLT by Cyclonix Designs"
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}
  ${NSD_CreateLabel} 0 0 100% 23u "BROWSE. CONNECT. MAKE IT YOURS."
  Pop $0
  ${NSD_CreateLabel} 0 26u 100% 31u "Your web apps, within reach.$\r$\nFloating WhatsApp, YouTube Music and AI panels beside your browsing."
  Pop $0
  ${NSD_CreateLabel} 0 61u 100% 31u "More control over your day.$\r$\nBuilt-in blocking controls, private tabs and site permission prompts."
  Pop $0
  ${NSD_CreateLabel} 0 96u 100% 31u "A workspace that feels like you.$\r$\nThemes, a collapsible sidebar, bookmarks and an encrypted password vault."
  Pop $0
  ${NSD_CreateLabel} 0 132u 100% 19u "Development preview - online services may have compatibility limits."
  Pop $0
  nsDialogs::Show
FunctionEnd

Function KryltLaunch
  ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" ""
FunctionEnd

Function KryltChooseDefault
  ; Explorer delegates Settings to the interactive user instead of the elevated
  ; installer account. Choosing a default is always left to Windows and the user.
  ${StdUtils.ExecShellAsUser} $0 "$WINDIR\explorer.exe" "open" "ms-settings:defaultapps?registeredAppMachine=KRYLT"
FunctionEnd
!endif
!macroend

!macro customFinishPage
  !define MUI_FINISHPAGE_TITLE "KRYLT is ready"
  !define MUI_FINISHPAGE_TEXT "Installed by Cyclonix Designs.$\r$\n$\r$\nSelect the optional default-browser choice below to open Windows Settings. Choose KRYLT, then Set default.$\r$\n$\r$\nYou can also do this later in KRYLT Settings > About."
  !define MUI_FINISHPAGE_RUN
  !define MUI_FINISHPAGE_RUN_TEXT "Launch KRYLT"
  !define MUI_FINISHPAGE_RUN_FUNCTION KryltLaunch
  !define MUI_FINISHPAGE_SHOWREADME
  !define MUI_FINISHPAGE_SHOWREADME_TEXT "Choose KRYLT as my default browser"
  !define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
  !define MUI_FINISHPAGE_SHOWREADME_FUNCTION KryltChooseDefault
  !insertmacro MUI_PAGE_FINISH
!macroend

!macro customInstall
  ; Stable legacy ProgIDs preserve existing browser associations across the rename.
  DeleteRegValue HKLM "Software\RegisteredApplications" "Tempest Ultra"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\App Paths\Tempest Ultra.exe"
  WriteRegStr HKLM "Software\Classes\TempestUltraURL" "" "KRYLT URL"
  WriteRegStr HKLM "Software\Classes\TempestUltraURL" "URL Protocol" ""
  WriteRegStr HKLM "Software\Classes\TempestUltraURL\DefaultIcon" "" '$\"$INSTDIR\KRYLT.exe$\",0'
  WriteRegStr HKLM "Software\Classes\TempestUltraURL\shell\open\command" "" '$\"$INSTDIR\KRYLT.exe$\" -- $\"%1$\"'
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra" "" "KRYLT"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\DefaultIcon" "" '$\"$INSTDIR\KRYLT.exe$\",0'
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\shell\open\command" "" '$\"$INSTDIR\KRYLT.exe$\"'
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities" "ApplicationName" "KRYLT"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities" "ApplicationDescription" "Modern browsing with web-app panels, personalisation and browsing controls. By Cyclonix Designs."
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities" "ApplicationIcon" '$\"$INSTDIR\KRYLT.exe$\",0'
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\Startmenu" "StartMenuInternet" "TempestUltra"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\URLAssociations" "http" "TempestUltraURL"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\URLAssociations" "https" "TempestUltraURL"
  ; Supported native file types become optional Windows defaults, not forced defaults.
  WriteRegStr HKLM "Software\Classes\KRYLT.File" "" "KRYLT browser document"
  WriteRegStr HKLM "Software\Classes\KRYLT.File\DefaultIcon" "" '$\"$INSTDIR\KRYLT.exe$\",0'
  WriteRegStr HKLM "Software\Classes\KRYLT.File\shell\open\command" "" '$\"$INSTDIR\KRYLT.exe$\" -- $\"%1$\"'
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".htm" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".html" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".shtml" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".xht" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".xhtml" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".pdf" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".jpg" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".jpeg" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".png" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".gif" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".webp" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".bmp" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".svg" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".ico" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".tif" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".tiff" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".avif" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".apng" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".jfif" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".mp4" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".webm" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".ogv" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".m4v" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".mp3" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".wav" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".ogg" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".opus" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".m4a" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".aac" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".flac" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".srt" "KRYLT.File"
  WriteRegStr HKLM "Software\Clients\StartMenuInternet\TempestUltra\Capabilities\FileAssociations" ".vtt" "KRYLT.File"
  WriteRegStr HKLM "Software\RegisteredApplications" "KRYLT" "Software\Clients\StartMenuInternet\TempestUltra\Capabilities"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\App Paths\KRYLT.exe" "" "$INSTDIR\KRYLT.exe"
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0x1003, p 0, p 0)'
!macroend

!macro customUnInstall
  DeleteRegValue HKLM "Software\RegisteredApplications" "Tempest Ultra"
  DeleteRegKey HKLM "Software\Classes\KRYLT.File"
  DeleteRegKey HKLM "Software\Classes\TempestUltraURL"
  DeleteRegKey HKLM "Software\Clients\StartMenuInternet\TempestUltra"
  DeleteRegValue HKLM "Software\RegisteredApplications" "KRYLT"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\App Paths\KRYLT.exe"
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0x1003, p 0, p 0)'
!macroend
