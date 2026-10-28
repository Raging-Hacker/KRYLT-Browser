; Branded assisted installer. Browser registration offers a choice in Windows;
; it never writes UserChoice or changes the user's current default.
!include nsDialogs.nsh
!include MUI2.nsh

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to KRYLT"
  !define MUI_WELCOMEPAGE_TEXT "Modern browsing. Your way.$\r$\n$\r$\nFrom Cyclonix Designs.$\r$\n$\r$\nKeep your favourite web apps close, personalise your workspace and take control of everyday browsing.$\r$\n$\r$\nSetup replaces existing KRYLT program files. Browser data is retained during upgrades. Uninstall permanently deletes app profiles, saved passwords and settings. You can choose the installation folder on the next page."
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customPageAfterChangeDir
  Page custom KryltBenefits
!macroend

!macro customHeader
!ifndef BUILD_UNINSTALLER
Section "-Clean previous KRYLT runtime" KRYLT_CLEANUP_SECTION
  InitPluginsDir
  File /oname=$PLUGINSDIR\krylt-clean-install.ps1 "${BUILD_RESOURCES_DIR}\clean-install.ps1"
  nsExec::ExecToStack '"$WINDIR\SysNative\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "$PLUGINSDIR\krylt-clean-install.ps1" -InstallDirectory "$INSTDIR"'
  Pop $0
  Pop $1
  ${If} $0 != 0
    MessageBox MB_OK|MB_ICONSTOP "Existing files could not be safely prepared for installation. Close KRYLT and choose its existing installation folder or an empty folder.$\r$\n$1"
    Abort
  ${EndIf}
SectionEnd

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
  ${NSD_CreateLabel} 0 132u 100% 19u "Uninstall removes browser data and saved passwords. Export an encrypted backup first if needed."
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
  FileOpen $0 "$INSTDIR\.krylt-install" w
  FileWrite $0 "KRYLT by Cyclonix Designs"
  FileClose $0
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
  WriteRegStr HKLM "Software\RegisteredApplications" "KRYLT" "Software\Clients\StartMenuInternet\TempestUltra\Capabilities"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\App Paths\KRYLT.exe" "" "$INSTDIR\KRYLT.exe"
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0x1003, p 0, p 0)'
!macroend

!macro customUnInstall
  ${IfNot} ${isUpdated}
    InitPluginsDir
    File /oname=$PLUGINSDIR\krylt-clean-profile.ps1 "${BUILD_RESOURCES_DIR}\clean-profile.ps1"
    nsExec::ExecToStack '"$WINDIR\SysNative\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "$PLUGINSDIR\krylt-clean-profile.ps1"'
    Pop $0
    Pop $1
    ${If} $0 != 0
      MessageBox MB_OK|MB_ICONEXCLAMATION "Some KRYLT profile files could not be deleted (locked or redirected folders). Close remaining browser processes and remove the app-specific folders manually.$\r$\n$1"
    ${EndIf}
  ${EndIf}
  DeleteRegValue HKLM "Software\RegisteredApplications" "Tempest Ultra"
  DeleteRegKey HKLM "Software\Classes\TempestUltraURL"
  DeleteRegKey HKLM "Software\Clients\StartMenuInternet\TempestUltra"
  DeleteRegValue HKLM "Software\RegisteredApplications" "KRYLT"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\App Paths\KRYLT.exe"
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0x1003, p 0, p 0)'
!macroend

