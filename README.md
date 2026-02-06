
```
yourdrive
├─ apps
│  ├─ api
│  │  ├─ database-init.ts
│  │  ├─ package.json
│  │  ├─ prisma
│  │  │  ├─ migrations
│  │  │  │  ├─ 20260204172942_
│  │  │  │  │  └─ migration.sql
│  │  │  │  ├─ 20260205165140_add_password_reset_fields
│  │  │  │  │  └─ migration.sql
│  │  │  │  ├─ 20260205175942_add_password_reset_code_hash
│  │  │  │  │  └─ migration.sql
│  │  │  │  ├─ 20260205213314_add_email_verification
│  │  │  │  │  └─ migration.sql
│  │  │  │  └─ migration_lock.toml
│  │  │  └─ schema.prisma
│  │  ├─ src
│  │  │  ├─ config
│  │  │  │  ├─ passport.config.ts
│  │  │  │  └─ vert.config.ts
│  │  │  ├─ index.ts
│  │  │  ├─ lib
│  │  │  │  ├─ b2.service.ts
│  │  │  │  ├─ bigint-helper.ts
│  │  │  │  ├─ email.service.ts
│  │  │  │  ├─ helper.ts
│  │  │  │  └─ prisma.ts
│  │  │  ├─ middleware
│  │  │  │  └─ auth.middleware.ts
│  │  │  ├─ routes
│  │  │  │  ├─ auth.routes.ts
│  │  │  │  ├─ conversion.routes.ts
│  │  │  │  ├─ devices.routes.ts
│  │  │  │  ├─ favorite.routes.ts
│  │  │  │  ├─ files.routes.ts
│  │  │  │  ├─ settings.routes.ts
│  │  │  │  ├─ sharing.routes.ts
│  │  │  │  └─ storage.routes.ts
│  │  │  └─ services
│  │  │     ├─ auth.service.ts
│  │  │     ├─ device.service.ts
│  │  │     ├─ settings.service.ts
│  │  │     ├─ storage.service.ts
│  │  │     └─ tempfix.ts
│  │  ├─ temp
│  │  │  └─ chunks
│  │  └─ tsconfig.json
│  ├─ converter
│  │  └─ src
│  │     └─ index.ts
│  └─ web
│     ├─ eslint.config.js
│     ├─ index.html
│     ├─ package.json
│     ├─ public
│     │  ├─ fonts
│     │  │  ├─ FormaDJRBanner-Bold-Testing.woff
│     │  │  └─ FormaDJRDisplay-Bold-Testing.woff2
│     │  ├─ Images
│     │  │  ├─ Background-1.png
│     │  │  ├─ Background.png
│     │  │  ├─ Background.svg
│     │  │  ├─ Backgroundskib.png
│     │  │  ├─ Before.png
│     │  │  ├─ CCPA.svg
│     │  │  ├─ github.svg
│     │  │  ├─ Link.svg
│     │  │  └─ skibidi.png
│     │  ├─ logo.svg
│     │  └─ SvgIcons
│     │     ├─ dropdown.svg
│     │     ├─ IP.svg
│     │     ├─ UE.svg
│     │     ├─ upload.svg
│     │     └─ US.svg
│     ├─ README.md
│     ├─ src
│     │  ├─ App.tsx
│     │  ├─ components
│     │  │  ├─ aboutus
│     │  │  │  ├─ AboutUs.tsx
│     │  │  │  └─ components
│     │  │  │     ├─ coreValues
│     │  │  │     │  ├─ CoreValues.tsx
│     │  │  │     │  └─ styles
│     │  │  │     │     └─ coreValues.ts
│     │  │  │     ├─ heading
│     │  │  │     │  ├─ Heading.tsx
│     │  │  │     │  └─ styles
│     │  │  │     │     └─ heading.ts
│     │  │  │     ├─ reason
│     │  │  │     │  ├─ components
│     │  │  │     │  ├─ Reason.tsx
│     │  │  │     │  └─ styles
│     │  │  │     │     └─ reason.ts
│     │  │  │     └─ smtnelse
│     │  │  ├─ auth
│     │  │  │  ├─ ForgotPasswordModal.tsx
│     │  │  │  ├─ PasskeySetupModal.tsx
│     │  │  │  ├─ SocialLoginButtons.tsx
│     │  │  │  ├─ TwoFactorModal.tsx
│     │  │  │  ├─ TwoFactorSetupModal.tsx
│     │  │  │  └─ VerifyEmail.tsx
│     │  │  ├─ dashboard
│     │  │  │  ├─ component
│     │  │  │  │  ├─ Application.tsx
│     │  │  │  │  ├─ devices
│     │  │  │  │  │  └─ Devices.tsx
│     │  │  │  │  ├─ favorited
│     │  │  │  │  │  └─ Favorited.tsx
│     │  │  │  │  ├─ main
│     │  │  │  │  │  ├─ components
│     │  │  │  │  │  │  ├─ filters
│     │  │  │  │  │  │  │  ├─ AdvancedPopup.tsx
│     │  │  │  │  │  │  │  ├─ FileTypePopup.tsx
│     │  │  │  │  │  │  │  ├─ LastModifiedPopup.tsx
│     │  │  │  │  │  │  │  └─ PersonPopup.tsx
│     │  │  │  │  │  │  ├─ FolderPreviewModal.tsx
│     │  │  │  │  │  │  ├─ QuickSearch.tsx
│     │  │  │  │  │  │  ├─ RecentFiles.tsx
│     │  │  │  │  │  │  └─ SuggestedFolders.tsx
│     │  │  │  │  │  ├─ EmptyState.tsx
│     │  │  │  │  │  ├─ Home.tsx
│     │  │  │  │  │  ├─ Main.tsx
│     │  │  │  │  │  └─ styles
│     │  │  │  │  │     ├─ filterPopup.styles.ts
│     │  │  │  │  │     ├─ home.styles.ts
│     │  │  │  │  │     ├─ search.styles.ts
│     │  │  │  │  │     └─ suggestedFolders.styles.ts
│     │  │  │  │  ├─ recentlyEdited
│     │  │  │  │  │  └─ RecentlyEdited.tsx
│     │  │  │  │  ├─ recycleBin
│     │  │  │  │  │  └─ RecycleBin.tsx
│     │  │  │  │  ├─ sharedWithYou
│     │  │  │  │  │  └─ SharedWithYou.tsx
│     │  │  │  │  ├─ sidebar
│     │  │  │  │  │  ├─ NavigationMenu.tsx
│     │  │  │  │  │  ├─ Sidebar.tsx
│     │  │  │  │  │  ├─ SidebarToggle.tsx
│     │  │  │  │  │  ├─ UpgradePrompt.tsx
│     │  │  │  │  │  └─ UserInfo.tsx
│     │  │  │  │  └─ yourFiles
│     │  │  │  │     └─ YourFiles.tsx
│     │  │  │  ├─ Dashboard.tsx
│     │  │  │  └─ styles
│     │  │  │     ├─ application.ts
│     │  │  │     ├─ main.ts
│     │  │  │     └─ sidebar.ts
│     │  │  ├─ features
│     │  │  │  ├─ components
│     │  │  │  │  ├─ cardsSection
│     │  │  │  │  │  ├─ CardsSection.tsx
│     │  │  │  │  │  └─ styles
│     │  │  │  │  │     └─ cardsSection.ts
│     │  │  │  │  ├─ exportPlatform
│     │  │  │  │  │  ├─ ExportPlatform.tsx
│     │  │  │  │  │  └─ styles
│     │  │  │  │  │     └─ exportPlatform.ts
│     │  │  │  │  ├─ featuresPart
│     │  │  │  │  │  ├─ FeaturesPart.tsx
│     │  │  │  │  │  └─ styles
│     │  │  │  │  │     └─ featuresPart.ts
│     │  │  │  │  └─ hero
│     │  │  │  │     ├─ Hero.tsx
│     │  │  │  │     └─ styles
│     │  │  │  │        └─ hero.ts
│     │  │  │  └─ Features.tsx
│     │  │  ├─ filesharingediting
│     │  │  │  ├─ FileSharingEditing.tsx
│     │  │  │  └─ styles
│     │  │  │     └─ fileSharingEditing.ts
│     │  │  ├─ helpcenter
│     │  │  │  └─ HelpCenter.tsx
│     │  │  ├─ howitworks
│     │  │  │  ├─ components
│     │  │  │  │  ├─ herosection
│     │  │  │  │  │  ├─ HeroSection.tsx
│     │  │  │  │  │  └─ styles
│     │  │  │  │  │     └─ heroSection.ts
│     │  │  │  │  └─ tutorialsection
│     │  │  │  │     ├─ styles
│     │  │  │  │     │  └─ tutorialSection.ts
│     │  │  │  │     └─ TutorialSection.tsx
│     │  │  │  └─ HowItWorks.tsx
│     │  │  ├─ landing
│     │  │  │  ├─ components
│     │  │  │  │  ├─ description
│     │  │  │  │  │  ├─ Description.tsx
│     │  │  │  │  │  └─ styles
│     │  │  │  │  │     └─ description.ts
│     │  │  │  │  ├─ faq
│     │  │  │  │  │  ├─ Faq.tsx
│     │  │  │  │  │  └─ styles
│     │  │  │  │  │     └─ faq.ts
│     │  │  │  │  ├─ features
│     │  │  │  │  │  ├─ Features.tsx
│     │  │  │  │  │  └─ styles
│     │  │  │  │  │     └─ features.ts
│     │  │  │  │  ├─ hero
│     │  │  │  │  │  ├─ Hero.tsx
│     │  │  │  │  │  └─ styles
│     │  │  │  │  │     └─ hero.ts
│     │  │  │  │  ├─ overview
│     │  │  │  │  │  ├─ Overview.tsx
│     │  │  │  │  │  └─ styles
│     │  │  │  │  │     └─ overview.ts
│     │  │  │  │  └─ tryout
│     │  │  │  │     ├─ styles
│     │  │  │  │     │  └─ tryout.ts
│     │  │  │  │     └─ Tryout.tsx
│     │  │  │  ├─ Landing.tsx
│     │  │  │  └─ styles
│     │  │  │     └─ landing.ts
│     │  │  ├─ login
│     │  │  │  └─ Login.tsx
│     │  │  ├─ personalstorage
│     │  │  │  ├─ PersonalStorage.tsx
│     │  │  │  └─ styles
│     │  │  │     └─ personalStorage.ts
│     │  │  ├─ pricing
│     │  │  │  ├─ components
│     │  │  │  │  └─ PlanSection
│     │  │  │  │     ├─ components
│     │  │  │  │     │  └─ plan
│     │  │  │  │     │     ├─ Plan.tsx
│     │  │  │  │     │     └─ styles
│     │  │  │  │     │        └─ plan.ts
│     │  │  │  │     ├─ PlanSection.tsx
│     │  │  │  │     └─ styles
│     │  │  │  │        └─ PlanSection.ts
│     │  │  │  └─ Pricing.tsx
│     │  │  ├─ privacypolicy
│     │  │  │  ├─ PrivacyPolicy.tsx
│     │  │  │  └─ styles
│     │  │  │     └─ privacyPolicy.ts
│     │  │  ├─ register
│     │  │  │  └─ Register.tsx
│     │  │  ├─ securestorage
│     │  │  │  ├─ SecureStorage.tsx
│     │  │  │  └─ styles
│     │  │  │     └─ secureStorage.ts
│     │  │  ├─ settings
│     │  │  │  ├─ components
│     │  │  │  │  ├─ AccountSection.tsx
│     │  │  │  │  ├─ SecuritySection.tsx
│     │  │  │  │  ├─ StorageSection.tsx
│     │  │  │  │  └─ TwoFactorSettings.tsx
│     │  │  │  ├─ service
│     │  │  │  │  └─ settingsService.ts
│     │  │  │  ├─ Settings.tsx
│     │  │  │  ├─ styles
│     │  │  │  │  └─ settings.styles.ts
│     │  │  │  └─ types
│     │  │  │     └─ UserSettings.ts
│     │  │  ├─ shared
│     │  │  │  ├─ button
│     │  │  │  │  └─ Button.tsx
│     │  │  │  ├─ cta
│     │  │  │  │  ├─ Cta.tsx
│     │  │  │  │  └─ styles
│     │  │  │  │     └─ cta.ts
│     │  │  │  ├─ enhancedFileTable
│     │  │  │  │  ├─ EnhancedFilesTable.tsx
│     │  │  │  │  └─ fileActions.ts
│     │  │  │  ├─ filesPreview
│     │  │  │  │  ├─ components
│     │  │  │  │  │  ├─ Header.tsx
│     │  │  │  │  │  ├─ InfoSidebar.tsx
│     │  │  │  │  │  ├─ Preview.tsx
│     │  │  │  │  │  └─ previews
│     │  │  │  │  │     ├─ AudioPreview.tsx
│     │  │  │  │  │     ├─ CodePreview.tsx
│     │  │  │  │  │     ├─ DocumentPreview.tsx
│     │  │  │  │  │     ├─ ImagePreview.tsx
│     │  │  │  │  │     ├─ OfficePreview.tsx
│     │  │  │  │  │     ├─ UnsupportedState.tsx
│     │  │  │  │  │     └─ VideoPreview.tsx
│     │  │  │  │  ├─ FilesPreview.tsx
│     │  │  │  │  ├─ styles
│     │  │  │  │  │  ├─ filePreview.styles.ts
│     │  │  │  │  │  └─ previewComponents.styles.ts
│     │  │  │  │  └─ utils
│     │  │  │  │     └─ FileTypeDetector.ts
│     │  │  │  ├─ files_table
│     │  │  │  │  ├─ FilesTable.tsx
│     │  │  │  │  └─ FileTypeIcon.tsx
│     │  │  │  ├─ footer
│     │  │  │  │  ├─ Footer.tsx
│     │  │  │  │  └─ styles
│     │  │  │  │     └─ footer.ts
│     │  │  │  ├─ hooks
│     │  │  │  │  ├─ useFileConversion.ts
│     │  │  │  │  ├─ useFileLoader.ts
│     │  │  │  │  ├─ useFileSearch.ts
│     │  │  │  │  ├─ useFileTracking.ts
│     │  │  │  │  ├─ useOutsideClick.ts
│     │  │  │  │  ├─ usePopupPosition.ts
│     │  │  │  │  ├─ useSettings.ts
│     │  │  │  │  └─ useTheme.ts
│     │  │  │  ├─ icons
│     │  │  │  │  ├─ calendar.tsx
│     │  │  │  │  ├─ chevronDown.tsx
│     │  │  │  │  ├─ devices.tsx
│     │  │  │  │  ├─ edit.tsx
│     │  │  │  │  ├─ file.tsx
│     │  │  │  │  ├─ files.tsx
│     │  │  │  │  ├─ FileUpload.tsx
│     │  │  │  │  ├─ filter.tsx
│     │  │  │  │  ├─ home.tsx
│     │  │  │  │  ├─ info.tsx
│     │  │  │  │  ├─ logout.tsx
│     │  │  │  │  ├─ newFolder.tsx
│     │  │  │  │  ├─ notificationCenter.tsx
│     │  │  │  │  ├─ person.tsx
│     │  │  │  │  ├─ plus.tsx
│     │  │  │  │  ├─ recentlyEdited.tsx
│     │  │  │  │  ├─ recycle.tsx
│     │  │  │  │  ├─ searchIcon.tsx
│     │  │  │  │  ├─ settings.tsx
│     │  │  │  │  ├─ share.tsx
│     │  │  │  │  ├─ sharedWithYou.tsx
│     │  │  │  │  ├─ smallFolder.tsx
│     │  │  │  │  ├─ starred.tsx
│     │  │  │  │  ├─ uploadFolder.tsx
│     │  │  │  │  └─ warning.tsx
│     │  │  │  ├─ image
│     │  │  │  │  └─ Image.tsx
│     │  │  │  ├─ landingbutton
│     │  │  │  │  ├─ LandingButton.tsx
│     │  │  │  │  └─ styles
│     │  │  │  │     └─ landingButton.ts
│     │  │  │  ├─ navbar
│     │  │  │  │  ├─ components
│     │  │  │  │  │  └─ NavButton.tsx
│     │  │  │  │  ├─ Navbar.tsx
│     │  │  │  │  └─ styles
│     │  │  │  │     └─ navbar.ts
│     │  │  │  ├─ navbar_main
│     │  │  │  │  ├─ components
│     │  │  │  │  ├─ Navbar_main.tsx
│     │  │  │  │  └─ styles
│     │  │  │  │     └─ navbar_main.ts
│     │  │  │  ├─ PageTransition.tsx
│     │  │  │  ├─ popups
│     │  │  │  │  ├─ conversion
│     │  │  │  │  │  └─ ConversionPopup.tsx
│     │  │  │  │  ├─ notification
│     │  │  │  │  │  └─ NotificationPopup.tsx
│     │  │  │  │  ├─ popup.store.ts
│     │  │  │  │  ├─ share
│     │  │  │  │  │  └─ SharePopup.tsx
│     │  │  │  │  ├─ styles
│     │  │  │  │  │  └─ general.ts
│     │  │  │  │  └─ upload
│     │  │  │  │     ├─ UploadPopup.tsx
│     │  │  │  │     ├─ UploadStatusModal.tsx
│     │  │  │  │     └─ UppyUploadPopup.tsx
│     │  │  │  ├─ Portal
│     │  │  │  │  └─ Portal.tsx
│     │  │  │  ├─ sharedViewer
│     │  │  │  │  └─ SharedViewer.tsx
│     │  │  │  ├─ styles
│     │  │  │  │  └─ general.ts
│     │  │  │  ├─ switch
│     │  │  │  │  ├─ styles
│     │  │  │  │  │  └─ switch.ts
│     │  │  │  │  └─ Switch.tsx
│     │  │  │  └─ utils
│     │  │  │     └─ computeSHA256.ts
│     │  │  ├─ teamcollaboration
│     │  │  │  ├─ styles
│     │  │  │  │  └─ teamCollaboration.ts
│     │  │  │  └─ TeamCollaboration.tsx
│     │  │  └─ termsofservice
│     │  │     ├─ styles
│     │  │     │  └─ termsOfService.ts
│     │  │     └─ TermsOfService.tsx
│     │  ├─ events
│     │  │  ├─ eventBus.ts
│     │  │  ├─ fileEvents.ts
│     │  │  └─ useEvent.ts
│     │  ├─ index.css
│     │  ├─ lib
│     │  │  ├─ axios.ts
│     │  │  └─ hardReload.ts
│     │  ├─ main.tsx
│     │  ├─ router
│     │  │  ├─ root.tsx
│     │  │  └─ router.tsx
│     │  ├─ services
│     │  │  └─ conversion.service.ts
│     │  ├─ store
│     │  │  ├─ authStore.ts
│     │  │  ├─ searchStore.ts
│     │  │  ├─ sidebarStore.ts
│     │  │  └─ storageStore.ts
│     │  └─ theme
│     │     └─ theme.ts
│     ├─ tsconfig.app.json
│     ├─ tsconfig.json
│     ├─ tsconfig.node.json
│     └─ vite.config.ts
├─ docker-compose.dev.yml
├─ package-lock.json
├─ package.json
├─ README.md
└─ scripts
   ├─ start-dev.js
   └─ start-vert.js

```