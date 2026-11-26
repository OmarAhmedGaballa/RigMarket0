import type { Locale } from '@/lib/i18n'

export type LegalSection = { h: string; p: string[]; list?: string[] }
export type LegalDoc = { title: string; intro: string; updated: string; sections: LegalSection[] }
export type LegalPageKey = 'privacy' | 'terms' | 'dataDeletion'

const UPDATED_EN = 'Last updated: November 2026'
const UPDATED_AR = 'آخر تحديث: نوفمبر 2026'

const en: Record<LegalPageKey, LegalDoc> = {
  privacy: {
    title: 'Privacy Policy',
    updated: UPDATED_EN,
    intro:
      'RigMarket is an online store for laptops and PC parts where members can also post ads. This page explains in simple words what information we use and why.',
    sections: [
      {
        h: 'What we collect',
        p: ['We only collect what we need to run your account and your orders:'],
        list: [
          'Sign-in details: your name, your email address and, if you sign in with Google or Facebook and allow it, your profile picture.',
          'Seller details: a mobile number and an ID photo, only if you want to post ads. These are private and are seen by our admins only, never by buyers.',
          'Order details: the name, phone number, city and address you type at checkout, and the payment method you choose.',
          'Ads you post: title, description, photos, price and quantity.',
          'Basic technical data: cookies that keep you signed in and remember your language and theme.',
        ],
      },
      {
        h: 'How we use it',
        p: ['We use your information to:'],
        list: [
          'Create your account, sign you in and keep it secure (including sending you a 6-digit email verification code).',
          'Manage your account, your ads and your orders.',
          'Contact you about your orders or your ads, for example to confirm, deliver or review them.',
          'Prevent fraud and misuse of the site.',
        ],
      },
      {
        h: 'We do not sell your data',
        p: [
          'RigMarket does not sell or rent users’ personal data to anyone. We share information only when it is needed to run the service (for example, the delivery details of an order so it can reach you, or hosting, database and email-sending providers that work for us), or when the law requires it.',
          'Buyers never see a seller’s phone number or ID photo.',
        ],
      },
      {
        h: 'Sign-in with Google or Facebook',
        p: [
          'If you choose to sign in with Google or Facebook, we receive only the basic profile details you allow (name, email and, optionally, your picture). We do not post anything on your behalf.',
        ],
      },
      {
        h: 'How long we keep it',
        p: [
          'We keep your information while your account is active. If you ask us to delete it, we do so as described on the data deletion page, except for records we must keep by law (for example, order and payment records).',
        ],
      },
      {
        h: 'Your choices',
        p: [
          'You can ask us to see, correct or delete your personal data at any time. To delete your data, see the User Data Deletion page.',
        ],
      },
      {
        h: 'Changes to this policy',
        p: ['We may update this policy from time to time. The date at the top shows the latest version.'],
      },
      {
        h: 'Contact us',
        p: ['Questions about your privacy? Contact customer service at rigmarket0@gmail.com.'],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    updated: UPDATED_EN,
    intro: 'By creating an account or using RigMarket you agree to these terms. If you do not agree, please do not use the site.',
    sections: [
      {
        h: 'Your account',
        p: [
          'You must give correct information and verify your email address. You are responsible for keeping your password safe and for everything done through your account. You must be old enough to enter into a contract under the law that applies to you.',
        ],
      },
      {
        h: 'Buying',
        p: [
          'Orders are placed with RigMarket through the cart and checkout. Prices, stock and payment methods are shown on the site and may change. An order is confirmed only after we accept it. Please give a correct phone number and address so we can reach you.',
          'Payment is made with one of the methods shown at checkout. Follow the instructions of the chosen method and enter the correct reference when it is requested.',
        ],
      },
      {
        h: 'Selling and posting ads',
        p: ['If you post an ad you agree that:'],
        list: [
          'Everything in the ad (title, description, photos, condition, price and quantity) is true and you are allowed to sell the item.',
          'Every ad is reviewed by our admins before it goes live. We may edit, decline, take down or delete any ad at our discretion, for example if it is misleading or breaks these terms.',
          'A site commission is added to your price when the ad goes live. The commission rate is shown when you post the ad and can change over time.',
          'You keep your quantity up to date and mark the ad as sold out when you have none left.',
          'You may lower the price of a live ad to run a discount, but you may not raise it.',
          'You provide a mobile number and ID photo before your first ad. They are kept private and used only for verification and order handling.',
        ],
      },
      {
        h: 'What is not allowed',
        p: ['You may not:'],
        list: [
          'Post stolen, counterfeit, illegal or dangerous items, or items you do not own.',
          'Post false, misleading or duplicate ads, or ads with photos you have no right to use.',
          'Try to take buyers or sellers off the site to avoid fees, or harass other users.',
          'Attack, scrape, overload or try to break into the site or other users’ accounts.',
        ],
      },
      {
        h: 'Cancellations and returns',
        p: [
          'Orders can be cancelled while they are still being processed, and stock is then restored. After shipping, returns and refunds are handled case by case through customer service.',
        ],
      },
      {
        h: 'Disclaimer',
        p: [
          'RigMarket is provided “as is”. We review ads but we cannot guarantee that every item description is perfectly accurate or that the site will always be available or free of errors. To the extent allowed by law, RigMarket is not liable for indirect or consequential losses arising from using the site.',
        ],
      },
      {
        h: 'Suspending accounts',
        p: ['We may suspend or close accounts that break these terms or put other users or the site at risk.'],
      },
      {
        h: 'Changes to these terms',
        p: ['We may update these terms. Continuing to use the site after a change means you accept the new version.'],
      },
      {
        h: 'Contact us',
        p: ['Customer service and contact: rigmarket0@gmail.com.'],
      },
    ],
  },
  dataDeletion: {
    title: 'User Data Deletion',
    updated: UPDATED_EN,
    intro:
      'You can ask us to delete your RigMarket account and the personal data linked to it at any time. This page explains how. It also applies if you signed in with Google or Facebook.',
    sections: [
      {
        h: 'How to request deletion',
        p: ['Send an email to rigmarket0@gmail.com with:'],
        list: [
          'Subject: “Delete my account”.',
          'The email address of the account (the one you sign in with, or the one used with Google/Facebook).',
          'Your name as it appears on the account, so we can find it.',
        ],
      },
      {
        h: 'Confirming it is you',
        p: [
          'To protect your account, please send the request from the same email address as the account. If you cannot, we may ask you a few questions to confirm that the account is yours before we delete anything.',
        ],
      },
      {
        h: 'What we delete',
        p: ['Once confirmed, we delete or anonymise:'],
        list: [
          'Your account (name, email, profile picture and password or sign-in link).',
          'Your seller details: mobile number and ID photo.',
          'Your ads and their photos.',
          'Any pending verification codes.',
        ],
      },
      {
        h: 'What we may have to keep',
        p: [
          'Records of completed orders and payments (including delivery details on them) may be kept for the period the law requires for accounting and dispute purposes. They are not used for anything else.',
        ],
      },
      {
        h: 'Confirmation and timing',
        p: [
          'We will reply to confirm that we received your request, and we will email you again when it has been processed. We process requests within 30 days, usually much faster.',
          'Deleting your account cannot be undone. Open orders should be completed or cancelled first.',
        ],
      },
      {
        h: 'Facebook and Google',
        p: [
          'Deleting your RigMarket data does not remove RigMarket from the apps list in your Facebook or Google account. You can remove it there yourself at any time from your account’s security or apps settings.',
        ],
      },
      {
        h: 'Contact us',
        p: ['Customer service: rigmarket0@gmail.com.'],
      },
    ],
  },
}

const ar: Record<LegalPageKey, LegalDoc> = {
  privacy: {
    title: 'سياسة الخصوصية',
    updated: UPDATED_AR,
    intro:
      'ريج ماركت متجر إلكتروني للابتوبات وقطع الكمبيوتر، ويمكن للأعضاء فيه نشر إعلاناتهم أيضًا. توضح هذه الصفحة ببساطة ما هي المعلومات التي نستخدمها ولماذا.',
    sections: [
      {
        h: 'ما الذي نجمعه',
        p: ['نجمع فقط ما نحتاجه لتشغيل حسابك وطلباتك:'],
        list: [
          'بيانات تسجيل الدخول: اسمك وبريدك الإلكتروني، وصورة ملفك الشخصي إذا سجّلت الدخول عبر جوجل أو فيسبوك ووافقت على ذلك.',
          'بيانات البائع: رقم موبايل وصورة بطاقة، فقط إذا أردت نشر إعلانات. هذه البيانات خاصة ولا يراها إلا مديرو الموقع، ولا يراها المشترون أبدًا.',
          'بيانات الطلب: الاسم ورقم الهاتف والمدينة والعنوان التي تكتبها عند إتمام الشراء، وطريقة الدفع التي تختارها.',
          'الإعلانات التي تنشرها: العنوان والوصف والصور والسعر والكمية.',
          'بيانات تقنية بسيطة: ملفات تعريف الارتباط (كوكيز) التي تبقيك مسجّل الدخول وتتذكر لغتك والمظهر.',
        ],
      },
      {
        h: 'كيف نستخدمها',
        p: ['نستخدم معلوماتك من أجل:'],
        list: [
          'إنشاء حسابك وتسجيل دخولك وحمايته (ويشمل إرسال رمز تحقق من 6 أرقام على بريدك).',
          'إدارة حسابك وإعلاناتك وطلباتك.',
          'التواصل معك بخصوص طلباتك أو إعلاناتك، مثل التأكيد أو التوصيل أو المراجعة.',
          'منع الاحتيال وإساءة استخدام الموقع.',
        ],
      },
      {
        h: 'لا نبيع بياناتك',
        p: [
          'لا يبيع ريج ماركت بيانات المستخدمين الشخصية ولا يؤجّرها لأي طرف. نشارك المعلومات فقط عند الحاجة لتشغيل الخدمة (مثل بيانات التوصيل في الطلب حتى يصلك، أو مزوّدي الاستضافة وقواعد البيانات وإرسال البريد الذين يعملون لصالحنا)، أو عندما يطلب القانون ذلك.',
          'لا يرى المشترون رقم هاتف البائع أو صورة بطاقته أبدًا.',
        ],
      },
      {
        h: 'تسجيل الدخول عبر جوجل أو فيسبوك',
        p: [
          'إذا اخترت تسجيل الدخول عبر جوجل أو فيسبوك فإننا نستلم فقط بيانات الملف الشخصي الأساسية التي تسمح بها (الاسم والبريد وربما الصورة). ولا ننشر أي شيء نيابةً عنك.',
        ],
      },
      {
        h: 'مدة الاحتفاظ بالبيانات',
        p: [
          'نحتفظ ببياناتك طالما حسابك نشط. وإذا طلبت حذفها فسنحذفها كما هو موضح في صفحة حذف البيانات، باستثناء السجلات التي يلزمنا القانون بالاحتفاظ بها (مثل سجلات الطلبات والدفع).',
        ],
      },
      {
        h: 'اختياراتك',
        p: ['يمكنك في أي وقت أن تطلب الاطلاع على بياناتك الشخصية أو تصحيحها أو حذفها. لحذف بياناتك راجع صفحة حذف بيانات المستخدم.'],
      },
      {
        h: 'تغييرات السياسة',
        p: ['قد نحدّث هذه السياسة من وقت لآخر، ويوضح التاريخ في أعلى الصفحة آخر نسخة.'],
      },
      {
        h: 'تواصل معنا',
        p: ['لأي استفسار عن خصوصيتك تواصل مع خدمة العملاء عبر rigmarket0@gmail.com.'],
      },
    ],
  },
  terms: {
    title: 'شروط الاستخدام',
    updated: UPDATED_AR,
    intro: 'بإنشاء حساب أو استخدام ريج ماركت فإنك توافق على هذه الشروط. وإذا لم توافق فنرجو عدم استخدام الموقع.',
    sections: [
      {
        h: 'حسابك',
        p: [
          'يجب أن تقدّم بيانات صحيحة وأن تفعّل بريدك الإلكتروني. أنت مسؤول عن حماية كلمة مرورك وعن كل ما يتم عبر حسابك، ويجب أن يكون عمرك مناسبًا لإبرام عقد وفق القانون المطبق عليك.',
        ],
      },
      {
        h: 'الشراء',
        p: [
          'تُقدَّم الطلبات إلى ريج ماركت عبر السلة وإتمام الشراء. الأسعار والمخزون وطرق الدفع معروضة في الموقع وقد تتغير. لا يُعتبر الطلب مؤكدًا إلا بعد قبولنا له. يرجى إدخال رقم هاتف وعنوان صحيحين لنتمكن من الوصول إليك.',
          'يتم الدفع بإحدى الطرق المعروضة عند إتمام الشراء، فاتبع تعليمات الطريقة المختارة وأدخل رقم العملية المرجعي عند طلبه.',
        ],
      },
      {
        h: 'البيع ونشر الإعلانات',
        p: ['عند نشر إعلان فإنك توافق على أن:'],
        list: [
          'كل ما في الإعلان (العنوان والوصف والصور والحالة والسعر والكمية) صحيح وأنك مخوّل ببيع المنتج.',
          'كل إعلان يراجعه مديرو الموقع قبل نشره، ويحق لنا تعديل أي إعلان أو رفضه أو إزالته أو حذفه إذا كان مضلِّلًا أو يخالف هذه الشروط.',
          'تُضاف عمولة للموقع إلى سعرك عند نشر الإعلان. تُعرض نسبة العمولة عند إنشاء الإعلان وقد تتغير مع الوقت.',
          'تحدّث الكمية دائمًا وتجعل الإعلان «نفد المخزون» عندما لا يتبقى لديك شيء.',
          'يمكنك خفض سعر إعلان منشور لعمل خصم، ولا يمكنك رفعه.',
          'تقدّم رقم موبايل وصورة بطاقة قبل أول إعلان، وتبقى سرّية وتُستخدم فقط للتحقق ومعالجة الطلبات.',
        ],
      },
      {
        h: 'ما هو غير مسموح',
        p: ['لا يجوز لك:'],
        list: [
          'نشر منتجات مسروقة أو مقلَّدة أو غير قانونية أو خطرة، أو منتجات لا تملكها.',
          'نشر إعلانات كاذبة أو مضلِّلة أو مكررة، أو بصور لا تملك حق استخدامها.',
          'محاولة إخراج المشترين أو البائعين من الموقع لتفادي الرسوم، أو مضايقة المستخدمين الآخرين.',
          'مهاجمة الموقع أو حسابات الآخرين أو تحميله فوق طاقته أو سحب بياناته أو محاولة اختراقه.',
        ],
      },
      {
        h: 'الإلغاء والاسترجاع',
        p: ['يمكن إلغاء الطلب ما دام قيد المعالجة، ويُعاد المخزون عندها. وبعد الشحن يتم التعامل مع الاسترجاع والاسترداد حالةً بحالة عبر خدمة العملاء.'],
      },
      {
        h: 'إخلاء المسؤولية',
        p: [
          'يُقدَّم ريج ماركت «كما هو». نراجع الإعلانات لكن لا نضمن أن كل وصف للمنتجات دقيق تمامًا، ولا أن الموقع سيعمل دائمًا أو يخلو من الأخطاء. وفي الحدود التي يسمح بها القانون، لا يتحمل ريج ماركت مسؤولية الأضرار غير المباشرة أو التبعية الناتجة عن استخدام الموقع.',
        ],
      },
      {
        h: 'إيقاف الحسابات',
        p: ['يجوز لنا إيقاف أو إغلاق الحسابات التي تخالف هذه الشروط أو تعرّض المستخدمين الآخرين أو الموقع للخطر.'],
      },
      {
        h: 'تغيير الشروط',
        p: ['قد نحدّث هذه الشروط، واستمرارك في استخدام الموقع بعد التغيير يعني قبولك للنسخة الجديدة.'],
      },
      {
        h: 'تواصل معنا',
        p: ['خدمة العملاء والتواصل: rigmarket0@gmail.com.'],
      },
    ],
  },
  dataDeletion: {
    title: 'حذف بيانات المستخدم',
    updated: UPDATED_AR,
    intro:
      'يمكنك في أي وقت أن تطلب حذف حسابك في ريج ماركت والبيانات الشخصية المرتبطة به. توضح هذه الصفحة الخطوات، وتنطبق أيضًا إذا سجّلت الدخول عبر جوجل أو فيسبوك.',
    sections: [
      {
        h: 'كيف تطلب الحذف',
        p: ['أرسل رسالة إلى rigmarket0@gmail.com تتضمن:'],
        list: [
          'العنوان: «حذف حسابي».',
          'البريد الإلكتروني للحساب (الذي تسجّل به الدخول أو المستخدم مع جوجل/فيسبوك).',
          'اسمك كما يظهر في الحساب لنتمكن من العثور عليه.',
        ],
      },
      {
        h: 'التأكد من أنك صاحب الحساب',
        p: [
          'لحماية حسابك يرجى إرسال الطلب من نفس البريد المسجّل في الحساب. وإن تعذّر ذلك فقد نطرح عليك بعض الأسئلة للتأكد من ملكيتك للحساب قبل حذف أي شيء.',
        ],
      },
      {
        h: 'ما الذي نحذفه',
        p: ['بعد التأكيد نحذف أو نُخفي هوية:'],
        list: [
          'حسابك (الاسم والبريد وصورة الملف الشخصي وكلمة المرور أو ربط تسجيل الدخول).',
          'بيانات البائع: رقم الموبايل وصورة البطاقة.',
          'إعلاناتك وصورها.',
          'أي رموز تحقق معلّقة.',
        ],
      },
      {
        h: 'ما قد نضطر للاحتفاظ به',
        p: [
          'قد نحتفظ بسجلات الطلبات والمدفوعات المكتملة (بما فيها بيانات التوصيل بها) للمدة التي يفرضها القانون لأغراض المحاسبة وحل النزاعات، ولا تُستخدم لأي غرض آخر.',
        ],
      },
      {
        h: 'التأكيد ومدة التنفيذ',
        p: [
          'سنرد عليك لتأكيد استلام طلبك، وسنراسلك مرة أخرى عند الانتهاء من معالجته. نعالج الطلبات خلال 30 يومًا كحد أقصى، وغالبًا أسرع من ذلك بكثير.',
          'حذف الحساب لا يمكن التراجع عنه، ويفضّل إتمام الطلبات المفتوحة أو إلغاؤها قبل ذلك.',
        ],
      },
      {
        h: 'فيسبوك وجوجل',
        p: [
          'حذف بياناتك من ريج ماركت لا يزيل التطبيق من قائمة التطبيقات في حسابك على فيسبوك أو جوجل. يمكنك إزالته بنفسك في أي وقت من إعدادات الأمان أو التطبيقات في حسابك هناك.',
        ],
      },
      {
        h: 'تواصل معنا',
        p: ['خدمة العملاء: rigmarket0@gmail.com.'],
      },
    ],
  },
}

export function getLegalDoc(page: LegalPageKey, locale: Locale): LegalDoc {
  return (locale === 'ar' ? ar : en)[page]
}
