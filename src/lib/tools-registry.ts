export interface Tool {
  slug: string;
  category: string;
  emoji: string;
  labelKey: string;
  href: string;
  available: boolean;
}

export const tools: Tool[] = [
  // Performance
  { slug: 'ttfb-check', category: 'performance', emoji: '🚀', labelKey: 'Ttfb.title', href: '/utilities/performance/ttfb-check', available: true },
  
  // Document
  { slug: 'hwp-pdf-converter', category: 'document', emoji: '📄', labelKey: 'DocumentBoard.hwp-pdf-converter.title', href: '/utilities/document/hwp-pdf-converter', available: true },
  { slug: 'img-pdf-converter', category: 'document', emoji: '🖼️', labelKey: 'DocumentBoard.img-pdf-converter.title', href: '/utilities/document/img-pdf-converter', available: true },
  { slug: 'pdf-masking', category: 'document', emoji: '🛡️', labelKey: 'DocumentBoard.pdf-masking.title', href: '/utilities/document/pdf-masking', available: true },

  // Finance
  { slug: 'vat-calc', category: 'finance', emoji: '🧾', labelKey: 'FinanceBoard.vat-calc.title', href: '/utilities/finance/vat-calc', available: true },
  { slug: 'percentage-calc', category: 'finance', emoji: '🔢', labelKey: 'FinanceBoard.percentage-calc.title', href: '/utilities/finance/percentage-calc', available: true },
  { slug: 'interest-calc', category: 'finance', emoji: '💰', labelKey: 'FinanceBoard.interest-calc.title', href: '/utilities/finance/interest-calc', available: true },
  { slug: 'tax-33-calc', category: 'finance', emoji: '💼', labelKey: 'FinanceBoard.tax-33-calc.title', href: '/utilities/finance/tax-33-calc', available: true },
  { slug: 'salary-calc', category: 'finance', emoji: '💵', labelKey: 'FinanceBoard.salary-calc.title', href: '/utilities/finance/salary-calc', available: true },
  { slug: 'exchange-rate', category: 'finance', emoji: '💱', labelKey: 'FinanceBoard.exchange-rate.title', href: '/utilities/finance/exchange-rate', available: true },
  { slug: 'coin-profit', category: 'finance', emoji: '🪙', labelKey: 'FinanceBoard.coin-profit.title', href: '/utilities/finance/coin-profit', available: true },

  // Productivity
  { slug: 'pomodoro', category: 'productivity', emoji: '🍅', labelKey: 'ProductivityBoard.pomodoro.title', href: '/utilities/productivity/pomodoro', available: true },
  { slug: 'world-time', category: 'productivity', emoji: '🌍', labelKey: 'ProductivityBoard.world-time.title', href: '/utilities/productivity/world-time', available: true },
  { slug: 'resume-helper', category: 'productivity', emoji: '📝', labelKey: 'ProductivityBoard.resume-helper.title', href: '/utilities/productivity/resume-helper', available: true },
  { slug: 'excel-mapper', category: 'productivity', emoji: '📊', labelKey: 'ProductivityBoard.excel-mapper.title', href: '/utilities/productivity/excel-mapper', available: true },
  { slug: 'bomb-pad', category: 'productivity', emoji: '💣', labelKey: 'ProductivityBoard.bomb-pad.title', href: '/utilities/productivity/bomb-pad', available: true },

  // Design
  { slug: 'logo-favicon', category: 'design', emoji: '🎨', labelKey: 'DesignBoard.logo-favicon.title', href: '/utilities/design/logo-favicon', available: true },
  { slug: 'color-palette', category: 'design', emoji: '🎯', labelKey: 'DesignBoard.color-palette.title', href: '/utilities/design/color-palette', available: true },
  { slug: 'font-preview', category: 'design', emoji: '🔤', labelKey: 'DesignBoard.font-preview.title', href: '/utilities/design/font-preview', available: true },
  { slug: 'formation-planner', category: 'design', emoji: '🕴️', labelKey: 'DesignBoard.formation-planner.title', href: '/utilities/design/formation-planner', available: true },

  { slug: 'photo-batch-master', category: 'design', emoji: '📸', labelKey: 'DesignBoard.photo-batch-master.title', href: '/utilities/design/photo-batch-master', available: true },

  // Marketing
  { slug: 'osmu-formatter', category: 'marketing', emoji: '📤', labelKey: 'MarketingBoard.osmu-formatter.title', href: '/utilities/marketing/osmu-formatter', available: true },
  { slug: 'hashtag-generator', category: 'marketing', emoji: '🏷️', labelKey: 'MarketingBoard.hashtag-generator.title', href: '/utilities/marketing/hashtag-generator', available: true },
  { slug: 'qr-generator', category: 'marketing', emoji: '🔗', labelKey: 'MarketingBoard.qr-generator.title', href: '/utilities/marketing/qr-generator', available: true },
  { slug: 'shorturl', category: 'marketing', emoji: '✂️', labelKey: 'MarketingBoard.shorturl.title', href: '/utilities/marketing/shorturl', available: true },
  { slug: 'quiz-builder', category: 'marketing', emoji: '🧠', labelKey: 'MarketingBoard.quiz-builder.title', href: '/utilities/marketing/quiz-builder', available: true },

  // Lifestyle
  { slug: 'gpa-calc', category: 'lifestyle', emoji: '🎓', labelKey: 'LifestyleBoard.gpa-calc.title', href: '/utilities/lifestyle/gpa-calc', available: true },
  { slug: 'dday-calc', category: 'lifestyle', emoji: '📅', labelKey: 'LifestyleBoard.dday-calc.title', href: '/utilities/lifestyle/dday-calc', available: true },
  { slug: 'age-calc', category: 'lifestyle', emoji: '🎂', labelKey: 'LifestyleBoard.age-calc.title', href: '/utilities/lifestyle/age-calc', available: true },
  { slug: 'bmi-calc', category: 'lifestyle', emoji: '⚖️', labelKey: 'LifestyleBoard.bmi-calc.title', href: '/utilities/lifestyle/bmi-calc', available: true },
  { slug: 'mbti-test', category: 'lifestyle', emoji: '🌊', labelKey: 'LifestyleBoard.mbti-test.title', href: '/utilities/lifestyle/mbti-test', available: true },
  { slug: 'pet-calorie', category: 'lifestyle', emoji: '🐾', labelKey: 'LifestyleBoard.pet-calorie.title', href: '/utilities/lifestyle/pet-calorie', available: true },
  { slug: 'aquarium-calc', category: 'lifestyle', emoji: '🐠', labelKey: 'LifestyleBoard.aquarium-calc.title', href: '/utilities/lifestyle/aquarium-calc', available: true },
  { slug: 'fortune-prompt', category: 'lifestyle', emoji: '🔮', labelKey: 'LifestyleBoard.fortune-prompt.title', href: '/utilities/lifestyle/fortune-prompt', available: true },
  { slug: 'color-coordinator', category: 'lifestyle', emoji: '🧥', labelKey: 'LifestyleBoard.color-coordinator.title', href: '/utilities/lifestyle/color-coordinator', available: true },

  // Security
  { slug: 'privacy-masking', category: 'security', emoji: '🔒', labelKey: 'SecurityBoard.privacy-masking.title', href: '/utilities/security/privacy-masking', available: true },
  { slug: 'password-generator', category: 'security', emoji: '🔑', labelKey: 'SecurityBoard.password-generator.title', href: '/utilities/security/password-generator', available: true },
  { slug: 'url-safety', category: 'security', emoji: '🛡️', labelKey: 'SecurityBoard.url-safety.title', href: '/utilities/security/url-safety', available: true },

  // Utility
  { slug: 'wordle', category: 'utility', emoji: '🎮', labelKey: 'UtilityBoard.wordle.title', href: '/utilities/utility/wordle', available: true },
  { slug: 'counter', category: 'utility', emoji: '🔢', labelKey: 'UtilityBoard.counter.title', href: '/utilities/utility/counter', available: true },
  { slug: 'unit-converter', category: 'utility', emoji: '📏', labelKey: 'UtilityBoard.unit-converter.title', href: '/utilities/utility/unit-converter', available: true },
  { slug: 'yt-thumbnail', category: 'utility', emoji: '📺', labelKey: 'UtilityBoard.yt-thumbnail.title', href: '/utilities/utility/yt-thumbnail', available: true },
  { slug: 'pyeong-calc', category: 'utility', emoji: '🏠', labelKey: 'UtilityBoard.pyeong-calc.title', href: '/utilities/utility/pyeong-calc', available: true },
  { slug: 'image-processor', category: 'utility', emoji: '🖼️', labelKey: 'UtilityBoard.image-processor.title', href: '/utilities/utility/image-processor', available: true },

  // Dev
  { slug: 'json-formatter', category: 'dev', emoji: '🗂️', labelKey: 'DevBoard.json-formatter.title', href: '/utilities/dev/json-formatter', available: true },
  { slug: 'regex-tester', category: 'dev', emoji: '🔍', labelKey: 'DevBoard.regex-tester.title', href: '/utilities/dev/regex-tester', available: true },
  { slug: 'resistor-calc', category: 'dev', emoji: '📟', labelKey: 'DevBoard.resistor-calc.title', href: '/utilities/dev/resistor-calc', available: true },
  { slug: 'password-strength', category: 'dev', emoji: '🛡️', labelKey: 'DevBoard.password-strength.title', href: '/utilities/dev/password-strength', available: true },
  { slug: 'kec-grounding', category: 'dev', emoji: '⚡', labelKey: 'DevBoard.kec-grounding.title', href: '/utilities/dev/kec-grounding', available: true },
];
