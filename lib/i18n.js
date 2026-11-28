/**
 * ZanziBiz i18n - Complete Translation System
 * Supports: English (en) and Swahili (sw)
 */

const translations = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      categories: "Categories",
      listings: "Business Directory",
      about: "About",
      usefulInfo: "Travel Guide",
      signIn: "Sign In",
      signUp: "Sign Up",
      listYourBusiness: "List Your Business",
      dashboard: "Dashboard",
      myProfile: "My Profile",
      myListings: "My Listings",
      likedListings: "Liked Listings",
      settings: "Settings",
      logout: "Logout",
      adminDashboard: "Admin Dashboard",
      language: "Language"
    },

    // Hero Section
    hero: {
      title: "Zanzibar Travel Guide & Business Directory",
      subtitle: "Your complete travel guide to Zanzibar. Find verified local services, discover things to do, read reviews, and explore activities in Stone Town, Paje, Nungwi, and beyond",
      searchPlaceholder: "Search things to do, local services, activities...",
      allLocations: "All Locations",
      searchButton: "Search",
      stat1: "1000+ Businesses",
      stat2: "5000+ Reviews",
      stat3: "Verified Listings"
    },

    // Categories
    categories: {
      title: "Zanzibar Business Directory by Category",
      subtitle: "Find local services and things to do across Zanzibar",
      jobs: "Jobs",
      jobsDesc: "Find employment opportunities",
      events: "Events",
      eventsDesc: "Discover happenings",
      business: "Business",
      businessDesc: "Restaurants, clubs, taxis",
      automotive: "Automotive",
      automotiveDesc: "Cars & repairs",
      activities: "Activities",
      activitiesDesc: "Things to do: surfing, diving, tours, activities",
      usefulInfo: "Useful Info",
      usefulInfoDesc: "Tips & services",
      accommodation: "Accommodation",
      accommodationDesc: "Hotels and stays",
      viewAll: "View All",
      viewAllDesc: "Browse everything"
    },

    // Locations
    locations: {
      stoneTown: "Stone Town",
      nungwi: "Nungwi",
      paje: "Paje",
      jambiani: "Jambiani",
      kendwa: "Kendwa",
      zanzibar: "Zanzibar",
      allLocations: "All Locations"
    },

    // Listings
    listings: {
      featuredListings: "Featured Listings",
      boostedListings: "Boosted Listings",
      allListings: "All Listings",
      topBusinesses: "Top Businesses",
      newListings: "New Listings",
      viewDetails: "View Details",
      contactBusiness: "Contact Business",
      getDirections: "Get Directions",
      callNow: "Call Now",
      visitWebsite: "Visit Website",
      shareButton: "Share",
      saveButton: "Save",
      likeButton: "Like",
      boosted: "Boosted",
      new: "New",
      verified: "Verified",
      featured: "Featured",
      loading: "Loading...",
      noResults: "No results found",
      showing: "Showing",
      of: "of",
      results: "results",
      page: "Page",
      previous: "Previous",
      next: "Next",
      filters: "Filters",
      sortBy: "Sort by",
      gridView: "Grid View",
      listView: "List View"
    },

    // Business Dashboard
    business: {
      dashboard: "Business Dashboard",
      welcome: "Welcome back",
      overview: "Overview",
      myListings: "My Listings",
      addListing: "Add New Listing",
      editListing: "Edit Listing",
      deleteListing: "Delete Listing",
      boostListing: "Boost Listing",
      activeListings: "Active Listings",
      draftListings: "Draft Listings",
      expiredListings: "Expired Listings",
      tokenBalance: "Token Balance",
      purchaseTokens: "Purchase Tokens",
      buyTokens: "Buy Tokens",
      analytics: "Analytics",
      views: "Views",
      clicks: "Clicks",
      calls: "Calls",
      messages: "Messages",
      performance: "Performance",
      listings: "Listings",
      status: "Status",
      actions: "Actions",
      edit: "Edit",
      boost: "Boost",
      delete: "Delete",
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      expired: "Expired"
    },

    // Listing Form
    listingForm: {
      title: "Listing Title",
      titlePlaceholder: "Enter business name",
      description: "Description",
      descriptionPlaceholder: "Describe your business...",
      category: "Category",
      selectCategory: "Select a category",
      location: "Location",
      selectLocation: "Select location",
      address: "Address",
      addressPlaceholder: "Street address",
      phone: "Phone Number",
      phonePlaceholder: "+255 XXX XXX XXX",
      email: "Email",
      emailPlaceholder: "business@example.com",
      website: "Website",
      websitePlaceholder: "https://example.com",
      what3words: "What3Words Location",
      what3wordsPlaceholder: "///word.word.word",
      images: "Images",
      uploadImages: "Upload Images",
      features: "Features",
      parking: "Parking",
      wifi: "Wi-Fi",
      delivery: "Delivery",
      familyFriendly: "Family Friendly",
      petFriendly: "Pet Friendly",
      wheelchair: "Wheelchair Accessible",
      outdoorSeating: "Outdoor Seating",
      creditCards: "Accepts Credit Cards",
      hours: "Opening Hours",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
      closed: "Closed",
      open24: "Open 24 Hours",
      saveListing: "Save Listing",
      cancel: "Cancel",
      publishing: "Publishing...",
      published: "Published successfully!",
      error: "Error publishing listing"
    },

    // User Profile
    profile: {
      title: "My Profile",
      accountType: "Account Type",
      regularUser: "Regular User",
      businessOwner: "Business Owner",
      administrator: "Administrator",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone Number",
      location: "Location",
      bio: "Bio",
      profilePicture: "Profile Picture",
      changePicture: "Change Picture",
      uploadPicture: "Upload New Picture",
      editProfile: "Edit Profile",
      saveChanges: "Save Changes",
      savingChanges: "Saving...",
      changesSaved: "Changes saved successfully!",
      likedListings: "Liked Listings",
      myListings: "My Listings",
      recentActivity: "Recent Activity",
      stats: "Statistics",
      joined: "Joined",
      lastActive: "Last Active"
    },

    // Settings
    settings: {
      title: "Settings",
      accountSettings: "Account Settings",
      profileInfo: "Profile Information",
      securitySettings: "Security",
      notificationSettings: "Notifications",
      privacySettings: "Privacy",
      languageSettings: "Language",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      updatePassword: "Update Password",
      emailNotifications: "Email Notifications",
      pushNotifications: "Push Notifications",
      marketingEmails: "Marketing Emails",
      weeklyDigest: "Weekly Digest",
      newMessages: "New Messages",
      listingUpdates: "Listing Updates",
      deleteAccount: "Delete Account",
      deleteAccountWarning: "This action cannot be undone",
      preferredLanguage: "Preferred Language",
      saveSettings: "Save Settings",
      settingsSaved: "Settings saved successfully!"
    },

    // Authentication
    auth: {
      signIn: "Sign In",
      signUp: "Sign Up",
      signOut: "Sign Out",
      email: "Email Address",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "Enter password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      fullNamePlaceholder: "John Doe",
      accountType: "Account Type",
      regularUser: "Regular User",
      businessOwner: "Business Owner",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      resetPassword: "Reset Password",
      backToLogin: "Back to Login",
      createAccount: "Create Account",
      haveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      signInLink: "Sign in",
      signUpLink: "Sign up",
      signingIn: "Signing in...",
      signingUp: "Creating account...",
      welcomeBack: "Welcome Back to ZanziBiz",
      welcomeBackDesc: "Connect with local businesses and discover opportunities across Zanzibar",
      createAccountTitle: "Join ZanziBiz",
      createAccountDesc: "Start discovering and connecting with businesses in Zanzibar",
      orContinueWith: "Or continue with",
      termsAgree: "I agree to the",
      termsOfService: "Terms of Service",
      and: "and",
      privacyPolicy: "Privacy Policy"
    },

    // Admin Dashboard
    admin: {
      dashboard: "Admin Dashboard",
      overview: "Overview",
      users: "Users",
      businesses: "Businesses",
      listings: "Listings",
      reports: "Reports",
      analytics: "Analytics",
      settings: "Settings",
      totalUsers: "Total Users",
      totalBusinesses: "Total Businesses",
      totalListings: "Total Listings",
      activeListings: "Active Listings",
      pendingApproval: "Pending Approval",
      flaggedContent: "Flagged Content",
      recentActivity: "Recent Activity",
      userManagement: "User Management",
      contentModeration: "Content Moderation",
      systemSettings: "System Settings",
      viewAll: "View All",
      approve: "Approve",
      reject: "Reject",
      ban: "Ban",
      unban: "Unban",
      delete: "Delete",
      edit: "Edit"
    },

    // Common UI Elements
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Information",
      close: "Close",
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      delete: "Delete",
      edit: "Edit",
      update: "Update",
      create: "Create",
      add: "Add",
      remove: "Remove",
      back: "Back",
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      clear: "Clear",
      clearAll: "Clear All",
      apply: "Apply",
      reset: "Reset",
      view: "View",
      download: "Download",
      upload: "Upload",
      share: "Share",
      copy: "Copy",
      copied: "Copied!",
      more: "More",
      less: "Less",
      showMore: "Show More",
      showLess: "Show Less",
      readMore: "Read More",
      readLess: "Read Less",
      seeAll: "See All",
      collapse: "Collapse",
      expand: "Expand",
      yes: "Yes",
      no: "No",
      ok: "OK",
      done: "Done",
      skip: "Skip",
      required: "Required",
      optional: "Optional",
      select: "Select",
      selected: "Selected",
      all: "All",
      none: "None",
      other: "Other",
      language: "Language"
    },

    // Footer
    footer: {
      forUsers: "For Users",
      forBusinesses: "For Businesses",
      company: "Company",
      browseListings: "Browse Listings",
      featuredBusinesses: "Featured Businesses",
      createAccount: "Create Account",
      listBusiness: "List Your Business",
      businessLogin: "Business Login",
      pricing: "Pricing",
      aboutUs: "About Us",
      contact: "Contact",
      helpCenter: "Help Center",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      copyright: "© 2025 ZanziBiz. All rights reserved. Made with ❤️ in Zanzibar"
    },

    // About Section
    about: {
      title: "Why Choose ZanziBiz?",
      subtitle: "The best way to discover local businesses in Zanzibar",
      feature1Title: "Verified Businesses",
      feature1Desc: "All listings are verified to ensure quality and authenticity",
      feature2Title: "Real Reviews",
      feature2Desc: "Read genuine reviews from real customers to make informed decisions",
      feature3Title: "Quick & Easy",
      feature3Desc: "Find what you need instantly with our powerful search and filters"
    },

    // CTA Section
    cta: {
      title: "Ready to Grow Your Business?",
      description: "Join hundreds of businesses already on ZanziBiz and reach thousands of potential customers",
      button: "List Your Business Free"
    }
  },

  sw: {
    // Navigation
    nav: {
      home: "Nyumbani",
      categories: "Vikundi",
      listings: "Saraka ya Biashara",
      about: "Kuhusu",
      usefulInfo: "Mwongozo wa Usafiri",
      signIn: "Ingia",
      signUp: "Jisajili",
      listYourBusiness: "Orodhesha Biashara Yako",
      dashboard: "Dashibodi",
      myProfile: "Wasifu Wangu",
      myListings: "Orodha Zangu",
      likedListings: "Orodha Nilizopenda",
      settings: "Mipangilio",
      logout: "Toka",
      adminDashboard: "Dashibodi ya Msimamizi",
      language: "Lugha"
    },

    // Hero Section
    hero: {
      title: "Mwongozo wa Usafiri wa Zanzibar na Saraka ya Biashara",
      subtitle: "Mwongozo wako kamili wa kusafiri Zanzibar. Tafuta huduma za mitaa zilizothibitishwa, gundua mambo ya kufanya, soma maoni, na chunguza shughuli katika Mji Mkongwe, Paje, Nungwi, na zaidi",
      searchPlaceholder: "Tafuta mambo ya kufanya, huduma za mitaa, shughuli...",
      allLocations: "Maeneo Yote",
      searchButton: "Tafuta",
      stat1: "Biashara 1000+",
      stat2: "Maoni 5000+",
      stat3: "Orodha Zilizothibitishwa"
    },

    // Categories
    categories: {
      title: "Saraka ya Biashara ya Zanzibar kwa Kikundi",
      subtitle: "Pata huduma za mitaa na mambo ya kufanya katika Zanzibar",
      jobs: "Kazi",
      jobsDesc: "Tafuta ajira",
      events: "Matukio",
      eventsDesc: "Gundua matukio",
      business: "Biashara",
      businessDesc: "Migahawa, vilabu, teksi",
      automotive: "Magari",
      automotiveDesc: "Magari na ukarabati",
      activities: "Shughuli",
      activitiesDesc: "Mambo ya kufanya: kutiririka, kuzamia, ziara, shughuli",
      usefulInfo: "Taarifa Muhimu",
      usefulInfoDesc: "Vidokezo na huduma",
      accommodation: "Malazi",
      accommodationDesc: "Hoteli na makazi",
      viewAll: "Angalia Yote",
      viewAllDesc: "Vinjari kila kitu"
    },

    // Locations
    locations: {
      stoneTown: "Mji Mkongwe",
      nungwi: "Nungwi",
      paje: "Paje",
      jambiani: "Jambiani",
      kendwa: "Kendwa",
      zanzibar: "Zanzibar",
      allLocations: "Maeneo Yote"
    },

    // Listings
    listings: {
      featuredListings: "Orodha Maalum",
      boostedListings: "Orodha Zilizoimarishwa",
      allListings: "Orodha Zote",
      topBusinesses: "Biashara Bora",
      newListings: "Orodha Mpya",
      viewDetails: "Angalia Maelezo",
      contactBusiness: "Wasiliana na Biashara",
      getDirections: "Pata Maelekezo",
      callNow: "Piga Simu Sasa",
      visitWebsite: "Tembelea Tovuti",
      shareButton: "Shiriki",
      saveButton: "Hifadhi",
      likeButton: "Penda",
      boosted: "Imeimarishwa",
      new: "Mpya",
      verified: "Imethibitishwa",
      featured: "Maalum",
      loading: "Inapakia...",
      noResults: "Hakuna matokeo",
      showing: "Inaonyesha",
      of: "ya",
      results: "matokeo",
      page: "Ukurasa",
      previous: "Iliyotangulia",
      next: "Inayofuata",
      filters: "Vichujio",
      sortBy: "Panga kwa",
      gridView: "Muonekano wa Gridi",
      listView: "Muonekano wa Orodha"
    },

    // Business Dashboard
    business: {
      dashboard: "Dashibodi ya Biashara",
      welcome: "Karibu tena",
      overview: "Muhtasari",
      myListings: "Orodha Zangu",
      addListing: "Ongeza Orodha Mpya",
      editListing: "Hariri Orodha",
      deleteListing: "Futa Orodha",
      boostListing: "Imarisha Orodha",
      activeListings: "Orodha Hai",
      draftListings: "Orodha za Rasimu",
      expiredListings: "Orodha Zilizomalizika",
      tokenBalance: "Salio la Tokeni",
      purchaseTokens: "Nunua Tokeni",
      buyTokens: "Nunua Tokeni",
      analytics: "Takwimu",
      views: "Maoni",
      clicks: "Mibofyo",
      calls: "Simu",
      messages: "Ujumbe",
      performance: "Utendaji",
      listings: "Orodha",
      status: "Hali",
      actions: "Vitendo",
      edit: "Hariri",
      boost: "Imarisha",
      delete: "Futa",
      active: "Hai",
      inactive: "Haifanyi Kazi",
      pending: "Inasubiri",
      expired: "Imemalizika"
    },

    // Listing Form
    listingForm: {
      title: "Kichwa cha Orodha",
      titlePlaceholder: "Ingiza jina la biashara",
      description: "Maelezo",
      descriptionPlaceholder: "Eleza biashara yako...",
      category: "Kikundi",
      selectCategory: "Chagua kikundi",
      location: "Mahali",
      selectLocation: "Chagua mahali",
      address: "Anwani",
      addressPlaceholder: "Anwani ya mtaa",
      phone: "Nambari ya Simu",
      phonePlaceholder: "+255 XXX XXX XXX",
      email: "Barua Pepe",
      emailPlaceholder: "biashara@example.com",
      website: "Tovuti",
      websitePlaceholder: "https://example.com",
      what3words: "Mahali pa What3Words",
      what3wordsPlaceholder: "///neno.neno.neno",
      images: "Picha",
      uploadImages: "Pakia Picha",
      features: "Vipengele",
      parking: "Maegesho",
      wifi: "Wi-Fi",
      delivery: "Uwasilishaji",
      familyFriendly: "Rafiki kwa Familia",
      petFriendly: "Rafiki kwa Wanyama",
      wheelchair: "Inaweza Kufikiwa na Kiti cha Magurudumu",
      outdoorSeating: "Viti vya Nje",
      creditCards: "Inakubali Kadi za Mkopo",
      hours: "Masaa ya Kufungua",
      monday: "Jumatatu",
      tuesday: "Jumanne",
      wednesday: "Jumatano",
      thursday: "Alhamisi",
      friday: "Ijumaa",
      saturday: "Jumamosi",
      sunday: "Jumapili",
      closed: "Imefungwa",
      open24: "Wazi Masaa 24",
      saveListing: "Hifadhi Orodha",
      cancel: "Ghairi",
      publishing: "Inachapisha...",
      published: "Imechapishwa kwa mafanikio!",
      error: "Hitilafu ya kuchapisha orodha"
    },

    // User Profile
    profile: {
      title: "Wasifu Wangu",
      accountType: "Aina ya Akaunti",
      regularUser: "Mtumiaji wa Kawaida",
      businessOwner: "Mmiliki wa Biashara",
      administrator: "Msimamizi",
      fullName: "Jina Kamili",
      email: "Barua Pepe",
      phone: "Nambari ya Simu",
      location: "Mahali",
      bio: "Wasifu",
      profilePicture: "Picha ya Wasifu",
      changePicture: "Badilisha Picha",
      uploadPicture: "Pakia Picha Mpya",
      editProfile: "Hariri Wasifu",
      saveChanges: "Hifadhi Mabadiliko",
      savingChanges: "Inahifadhi...",
      changesSaved: "Mabadiliko yamehifadhiwa kwa mafanikio!",
      likedListings: "Orodha Nilizopenda",
      myListings: "Orodha Zangu",
      recentActivity: "Shughuli za Hivi Karibuni",
      stats: "Takwimu",
      joined: "Alijiunga",
      lastActive: "Hai Mwisho"
    },

    // Settings
    settings: {
      title: "Mipangilio",
      accountSettings: "Mipangilio ya Akaunti",
      profileInfo: "Taarifa za Wasifu",
      securitySettings: "Usalama",
      notificationSettings: "Arifa",
      privacySettings: "Faragha",
      languageSettings: "Lugha",
      changePassword: "Badilisha Nenosiri",
      currentPassword: "Nenosiri la Sasa",
      newPassword: "Nenosiri Jipya",
      confirmPassword: "Thibitisha Nenosiri",
      updatePassword: "Sasisha Nenosiri",
      emailNotifications: "Arifa za Barua Pepe",
      pushNotifications: "Arifa za Kusukuma",
      marketingEmails: "Barua Pepe za Masoko",
      weeklyDigest: "Muhtasari wa Kila Wiki",
      newMessages: "Ujumbe Mpya",
      listingUpdates: "Masasisho ya Orodha",
      deleteAccount: "Futa Akaunti",
      deleteAccountWarning: "Kitendo hiki hakiwezi kutenduliwa",
      preferredLanguage: "Lugha Inayopendelewa",
      saveSettings: "Hifadhi Mipangilio",
      settingsSaved: "Mipangilio imehifadhiwa kwa mafanikio!"
    },

    // Authentication
    auth: {
      signIn: "Ingia",
      signUp: "Jisajili",
      signOut: "Toka",
      email: "Anwani ya Barua Pepe",
      emailPlaceholder: "wewe@example.com",
      password: "Nenosiri",
      passwordPlaceholder: "Ingiza nenosiri",
      confirmPassword: "Thibitisha Nenosiri",
      fullName: "Jina Kamili",
      fullNamePlaceholder: "Juma Abdallah",
      accountType: "Aina ya Akaunti",
      regularUser: "Mtumiaji wa Kawaida",
      businessOwner: "Mmiliki wa Biashara",
      rememberMe: "Nikumbuke",
      forgotPassword: "Umesahau nenosiri?",
      resetPassword: "Weka Upya Nenosiri",
      backToLogin: "Rudi kwa Kuingia",
      createAccount: "Fungua Akaunti",
      haveAccount: "Tayari una akaunti?",
      dontHaveAccount: "Huna akaunti?",
      signInLink: "Ingia",
      signUpLink: "Jisajili",
      signingIn: "Inaingia...",
      signingUp: "Inafungua akaunti...",
      welcomeBack: "Karibu Tena ZanziBiz",
      welcomeBackDesc: "Unganisha na biashara za mitaa na gundua fursa katika Zanzibar",
      createAccountTitle: "Jiunge na ZanziBiz",
      createAccountDesc: "Anza kugundua na kuunganisha na biashara za Zanzibar",
      orContinueWith: "Au endelea na",
      termsAgree: "Nakubali",
      termsOfService: "Masharti ya Huduma",
      and: "na",
      privacyPolicy: "Sera ya Faragha"
    },

    // Admin Dashboard
    admin: {
      dashboard: "Dashibodi ya Msimamizi",
      overview: "Muhtasari",
      users: "Watumiaji",
      businesses: "Biashara",
      listings: "Orodha",
      reports: "Ripoti",
      analytics: "Takwimu",
      settings: "Mipangilio",
      totalUsers: "Jumla ya Watumiaji",
      totalBusinesses: "Jumla ya Biashara",
      totalListings: "Jumla ya Orodha",
      activeListings: "Orodha Hai",
      pendingApproval: "Inasubiri Idhini",
      flaggedContent: "Maudhui Yaliyolipishwa",
      recentActivity: "Shughuli za Hivi Karibuni",
      userManagement: "Usimamizi wa Watumiaji",
      contentModeration: "Usimamizi wa Maudhui",
      systemSettings: "Mipangilio ya Mfumo",
      viewAll: "Angalia Yote",
      approve: "Idhinisha",
      reject: "Kataa",
      ban: "Zuia",
      unban: "Ondoa Kizuizi",
      delete: "Futa",
      edit: "Hariri"
    },

    // Common UI Elements
    common: {
      loading: "Inapakia...",
      error: "Hitilafu",
      success: "Mafanikio",
      warning: "Onyo",
      info: "Taarifa",
      close: "Funga",
      save: "Hifadhi",
      cancel: "Ghairi",
      confirm: "Thibitisha",
      delete: "Futa",
      edit: "Hariri",
      update: "Sasisha",
      create: "Unda",
      add: "Ongeza",
      remove: "Ondoa",
      back: "Rudi",
      next: "Inayofuata",
      previous: "Iliyotangulia",
      submit: "Wasilisha",
      search: "Tafuta",
      filter: "Chuja",
      sort: "Panga",
      clear: "Futa",
      clearAll: "Futa Yote",
      apply: "Tekeleza",
      reset: "Weka Upya",
      view: "Angalia",
      download: "Pakua",
      upload: "Pakia",
      share: "Shiriki",
      copy: "Nakili",
      copied: "Imenakiliwa!",
      more: "Zaidi",
      less: "Kidogo",
      showMore: "Onyesha Zaidi",
      showLess: "Onyesha Kidogo",
      readMore: "Soma Zaidi",
      readLess: "Soma Kidogo",
      seeAll: "Angalia Yote",
      collapse: "Kunja",
      expand: "Panua",
      yes: "Ndiyo",
      no: "Hapana",
      ok: "Sawa",
      done: "Imekamilika",
      skip: "Ruka",
      required: "Inahitajika",
      optional: "Si Lazima",
      select: "Chagua",
      selected: "Umechagua",
      all: "Yote",
      none: "Hakuna",
      other: "Nyingine",
      language: "Lugha"
    },

    // Footer
    footer: {
      forUsers: "Kwa Watumiaji",
      forBusinesses: "Kwa Biashara",
      company: "Kampuni",
      browseListings: "Vinjari Orodha",
      featuredBusinesses: "Biashara Maalum",
      createAccount: "Fungua Akaunti",
      listBusiness: "Orodhesha Biashara Yako",
      businessLogin: "Ingia kwa Biashara",
      pricing: "Bei",
      aboutUs: "Kuhusu Sisi",
      contact: "Wasiliana",
      helpCenter: "Kituo cha Msaada",
      termsOfService: "Masharti ya Huduma",
      privacyPolicy: "Sera ya Faragha",
      copyright: "© 2025 ZanziBiz. Haki zote zimehifadhiwa. Imetengenezwa kwa ❤️ Zanzibar"
    },

    // About Section
    about: {
      title: "Kwa Nini Uchague ZanziBiz?",
      subtitle: "Njia bora ya kugundua biashara za mitaa Zanzibar",
      feature1Title: "Biashara Zilizothibitishwa",
      feature1Desc: "Orodha zote zimethibitishwa kuhakikisha ubora na uhalisi",
      feature2Title: "Maoni ya Kweli",
      feature2Desc: "Soma maoni ya kweli kutoka kwa wateja wa kweli ili kufanya maamuzi sahihi",
      feature3Title: "Haraka na Rahisi",
      feature3Desc: "Pata unachohitaji mara moja na utafutaji wetu wenye nguvu na vichujio"
    },

    // CTA Section
    cta: {
      title: "Uko Tayari Kukuza Biashara Yako?",
      description: "Jiunge na mamia ya biashara tayari kwenye ZanziBiz na fikia maelfu ya wateja watarajiwa",
      button: "Orodhesha Biashara Yako Bure"
    }
  }
};

let currentLanguage = localStorage.getItem('zanzibiz_language') || 'en';

export function getCurrentLanguage() {
  return currentLanguage;
}

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('zanzibiz_language', lang);
    document.documentElement.lang = lang;
    return true;
  }
  return false;
}

export function t(key) {
  const keys = key.split('.');
  let value = translations[currentLanguage];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key;
    }
  }

  return value || key;
}

export function initLanguage() {
  const savedLang = localStorage.getItem('zanzibiz_language');
  if (savedLang && translations[savedLang]) {
    currentLanguage = savedLang;
    document.documentElement.lang = savedLang;
  }
}

export { translations };
