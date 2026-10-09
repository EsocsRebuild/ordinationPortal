import { EcclesiasticalRank, ProvinceHierarchy, DistrictHierarchy, ParishBranch } from '@/types';

export const ESOCS_RANKS: EcclesiasticalRank[] = [
  // ==========================================
  // --- MALE ORDER OF ORDINATION (12 RANKS) ---
  // ==========================================
  {
    id: 'rank_brother',
    name: 'Brother',
    shortCode: 'BRO',
    orderLevel: 0,
    genderEligibility: 'male',
    minimumYearsInCurrentRank: 1,
    robingCategory: 'White_Gold',
    liturgicalColor: 'White',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
    theologicalRequirements: ['Baptismal Catechism', 'Order of Holy Services & C&S Doctrine'],
    description: 'Baptized faithful brother of the Holy Order.',
    levyBreakdown: {
      branchLevy: 5000,
      districtLevy: 5000,
      provincialLevy: 5000,
      nationalFee: 10000,
      total: 25000,
    },
  },
  {
    id: 'rank_aladura_male',
    name: 'Aladura',
    shortCode: 'ALD',
    orderLevel: 1,
    genderEligibility: 'male',
    prerequisiteRankId: 'rank_brother',
    prerequisiteRankName: 'Brother',
    minimumYearsInCurrentRank: 2,
    robingCategory: 'White_Gold',
    liturgicalColor: 'White',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
    theologicalRequirements: ['Basic Liturgy 101', 'Foundations of Prayer & Altar Sanctification'],
    description: 'Foundational holy order of prayer, intercession, and sanctuary preparation.',
    levyBreakdown: {
      branchLevy: 7000,
      districtLevy: 7000,
      provincialLevy: 8000,
      nationalFee: 13000,
      total: 35000,
    },
  },
  {
    id: 'rank_leader_male',
    name: 'Leader',
    shortCode: 'LDR',
    orderLevel: 2,
    genderEligibility: 'male',
    prerequisiteRankId: 'rank_aladura_male',
    prerequisiteRankName: 'Aladura',
    minimumYearsInCurrentRank: 2,
    robingCategory: 'White_Gold',
    liturgicalColor: 'White',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
    theologicalRequirements: ['Leadership in the Sanctuary', 'Order of Divine Services', 'Pastoral Stewardship'],
    description: 'Parish leader assisting elders in conducting services and pastoral coordination.',
    levyBreakdown: {
      branchLevy: 9000,
      districtLevy: 9000,
      provincialLevy: 12000,
      nationalFee: 15000,
      total: 45000,
    },
  },
  {
    id: 'rank_rabbi',
    name: 'Rabbi',
    shortCode: 'RAB',
    orderLevel: 3,
    genderEligibility: 'male',
    prerequisiteRankId: 'rank_leader_male',
    prerequisiteRankName: 'Leader',
    minimumYearsInCurrentRank: 3,
    robingCategory: 'White_Gold',
    liturgicalColor: 'White',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
    theologicalRequirements: ['Biblical Hermeneutics', 'Teacher in Israel Colloquium', 'Spiritual Warfare in Scripture'],
    description: 'Teachers and instructors of biblical doctrine, catechism, and sacred liturgical traditions.',
    levyBreakdown: {
      branchLevy: 10000,
      districtLevy: 10000,
      provincialLevy: 15000,
      nationalFee: 20000,
      total: 55000,
    },
  },
  {
    id: 'rank_pastor',
    name: 'Pastor',
    shortCode: 'PST',
    orderLevel: 4,
    genderEligibility: 'male',
    prerequisiteRankId: 'rank_rabbi',
    prerequisiteRankName: 'Rabbi',
    minimumYearsInCurrentRank: 3,
    robingCategory: 'White_Gold',
    liturgicalColor: 'White',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200',
    theologicalRequirements: ['Pastoral Care & Homiletics', 'Ecclesiastical Counseling', 'Parish Administration'],
    description: 'Shepherds of the local flock, preaching the Word and guiding parish members.',
    levyBreakdown: {
      branchLevy: 12000,
      districtLevy: 12000,
      provincialLevy: 18000,
      nationalFee: 23000,
      total: 65000,
    },
  },
  {
    id: 'rank_evangelist',
    name: 'Evangelist',
    shortCode: 'EVG',
    orderLevel: 5,
    genderEligibility: 'male',
    prerequisiteRankId: 'rank_pastor',
    prerequisiteRankName: 'Pastor',
    minimumYearsInCurrentRank: 3,
    robingCategory: 'White_Gold',
    liturgicalColor: 'White',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200',
    theologicalRequirements: ['Great Commission & Missions', 'Revival Ministry', 'Apologetics & Outreach'],
    description: 'Proclaimers of the Holy Gospel, revivalists, and missionary pioneers.',
    levyBreakdown: {
      branchLevy: 15000,
      districtLevy: 15000,
      provincialLevy: 20000,
      nationalFee: 30000,
      total: 80000,
    },
  },
  {
    id: 'rank_apostle_white',
    name: 'Apostle (White)',
    shortCode: 'APO',
    orderLevel: 6,
    genderEligibility: 'male',
    prerequisiteRankId: 'rank_evangelist',
    prerequisiteRankName: 'Evangelist',
    minimumYearsInCurrentRank: 4,
    robingCategory: 'White',
    liturgicalColor: 'White',
    badgeColor: 'bg-slate-100 text-slate-900 border-slate-400 font-bold dark:bg-slate-800 dark:text-white',
    theologicalRequirements: ['Advanced Ecclesiology', 'Church Administration', 'Liturgical Governance'],
    description: 'Foundational apostolic pillar with White liturgical stole, supervisory authority over divine services.',
    levyBreakdown: {
      branchLevy: 18000,
      districtLevy: 18000,
      provincialLevy: 24000,
      nationalFee: 35000,
      total: 95000,
    },
  },
  {
    id: 'rank_super_apostle_pink',
    name: 'Super Apostle (Pink)',
    shortCode: 'SUA',
    orderLevel: 7,
    genderEligibility: 'male',
    prerequisiteRankId: 'rank_apostle_white',
    prerequisiteRankName: 'Apostle (White)',
    minimumYearsInCurrentRank: 4,
    robingCategory: 'Pink',
    liturgicalColor: 'Pink',
    badgeColor: 'bg-pink-100 text-pink-900 border-pink-300 dark:bg-pink-950/60 dark:text-pink-200 font-bold',
    theologicalRequirements: ['Apostolic Jurisdiction & Council Laws', 'Synodical Liturgy', 'District Supervisory Ethics'],
    description: 'Super Apostle distinguished by Pink ceremonial liturgical sash, overseeing zonal parish developments.',
    levyBreakdown: {
      branchLevy: 20000,
      districtLevy: 20000,
      provincialLevy: 30000,
      nationalFee: 45000,
      total: 115000,
    },
  },
  {
    id: 'rank_senior_apostle_yellow',
    name: 'Senior Apostle (Yellow)',
    shortCode: 'SAP',
    orderLevel: 8,
    genderEligibility: 'male',
    prerequisiteRankId: 'rank_super_apostle_pink',
    prerequisiteRankName: 'Super Apostle (Pink)',
    minimumYearsInCurrentRank: 4,
    robingCategory: 'Yellow',
    liturgicalColor: 'Yellow',
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-400 dark:bg-yellow-950/60 dark:text-yellow-200 font-bold',
    theologicalRequirements: ['Synodical Jurisprudence', 'District Oversight & Episcopal Guidance', 'Theology of Sacraments'],
    description: 'Senior Apostle bearing Yellow/Gold bishopric stole, leading district governance and spiritual arbitration.',
    levyBreakdown: {
      branchLevy: 25000,
      districtLevy: 25000,
      provincialLevy: 35000,
      nationalFee: 55000,
      total: 140000,
    },
  },
  {
    id: 'rank_special_senior_apostle_blue',
    name: 'Special Senior Apostle (Blue)',
    shortCode: 'SSA',
    orderLevel: 9,
    genderEligibility: 'male',
    prerequisiteRankId: 'rank_senior_apostle_yellow',
    prerequisiteRankName: 'Senior Apostle (Yellow)',
    minimumYearsInCurrentRank: 5,
    robingCategory: 'Blue',
    liturgicalColor: 'Blue',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-950/60 dark:text-blue-200 font-bold',
    theologicalRequirements: ['Provincial Leadership Colloquium', 'High Council Ethics & Governance', 'Constitutional Law of Holy Order'],
    description: 'Special Senior Apostle bearing Royal Blue velvet stole & gold trim, presiding over provincial dioceses and synod meetings.',
    levyBreakdown: {
      branchLevy: 30000,
      districtLevy: 30000,
      provincialLevy: 45000,
      nationalFee: 65000,
      total: 170000,
    },
  },
  {
    id: 'rank_apostle_general_green',
    name: 'Apostle General (Green)',
    shortCode: 'APG',
    orderLevel: 10,
    genderEligibility: 'male',
    prerequisiteRankId: 'rank_special_senior_apostle_blue',
    prerequisiteRankName: 'Special Senior Apostle (Blue)',
    minimumYearsInCurrentRank: 5,
    robingCategory: 'Green',
    liturgicalColor: 'Green',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200 font-bold',
    theologicalRequirements: ['Apex Spiritual Council Fellowship', 'Holy Synod Supreme Ordinances', 'International Mission Jurisprudence'],
    description: 'Apostle General adorned in Emerald Green apex regalia, supreme council member advising His Most Eminence.',
    levyBreakdown: {
      branchLevy: 35000,
      districtLevy: 35000,
      provincialLevy: 50000,
      nationalFee: 80000,
      total: 200000,
    },
  },
  {
    id: 'rank_supervising_apostle_general_green',
    name: 'Supervising Apostle General (Green)',
    shortCode: 'SAG',
    orderLevel: 11,
    genderEligibility: 'male',
    prerequisiteRankId: 'rank_apostle_general_green',
    prerequisiteRankName: 'Apostle General (Green)',
    minimumYearsInCurrentRank: 6,
    robingCategory: 'Green',
    liturgicalColor: 'Green',
    badgeColor: 'bg-emerald-200 text-emerald-950 border-emerald-500 dark:bg-emerald-900/90 dark:text-emerald-100 font-extrabold shadow-sm',
    theologicalRequirements: ['Supreme Head Advisory Conclave', 'Apex Sovereign Ecclesiastical Doctorate', 'Universal Synod Presidency'],
    description: 'Supervising Apostle General bearing Emerald Green apex patriarchal regalia with gold fringe, commanding international diocesan oversight.',
    levyBreakdown: {
      branchLevy: 45000,
      districtLevy: 45000,
      provincialLevy: 60000,
      nationalFee: 100000,
      total: 250000,
    },
  },

  // ============================================
  // --- FEMALE ORDER OF ORDINATION (10 RANKS) ---
  // ============================================
  {
    id: 'rank_sister',
    name: 'Sister',
    shortCode: 'SIS',
    orderLevel: 0,
    genderEligibility: 'female',
    minimumYearsInCurrentRank: 1,
    robingCategory: 'White_Gold',
    liturgicalColor: 'White',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
    theologicalRequirements: ['Baptismal Catechism', 'Order of Holy Services & Sisterhood Devotion'],
    description: 'Baptized faithful sister of the Holy Order.',
    levyBreakdown: {
      branchLevy: 5000,
      districtLevy: 5000,
      provincialLevy: 5000,
      nationalFee: 10000,
      total: 25000,
    },
  },
  {
    id: 'rank_lady_aladura',
    name: 'Lady Aladura',
    shortCode: 'LAD',
    orderLevel: 1,
    genderEligibility: 'female',
    prerequisiteRankId: 'rank_sister',
    prerequisiteRankName: 'Sister',
    minimumYearsInCurrentRank: 2,
    robingCategory: 'White_Gold',
    liturgicalColor: 'White',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
    theologicalRequirements: ['Basic Liturgy 101', 'Foundations of Prayer & Altar Sanctification'],
    description: 'Foundational female order of prayer, intercession, and sanctuary preparation.',
    levyBreakdown: {
      branchLevy: 7000,
      districtLevy: 7000,
      provincialLevy: 8000,
      nationalFee: 13000,
      total: 35000,
    },
  },
  {
    id: 'rank_lady_leader',
    name: 'Lady Leader',
    shortCode: 'LLD',
    orderLevel: 2,
    genderEligibility: 'female',
    prerequisiteRankId: 'rank_lady_aladura',
    prerequisiteRankName: 'Lady Aladura',
    minimumYearsInCurrentRank: 2,
    robingCategory: 'White_Gold',
    liturgicalColor: 'White',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
    theologicalRequirements: ['Women in Ministry Leadership', 'Pastoral Care & Welfare', 'Liturgical Order'],
    description: 'Leader of the female fold, championing women fellowship, spiritual growth, and parish welfare.',
    levyBreakdown: {
      branchLevy: 9000,
      districtLevy: 9000,
      provincialLevy: 12000,
      nationalFee: 15000,
      total: 45000,
    },
  },
  {
    id: 'rank_dorcas',
    name: 'Dorcas',
    shortCode: 'DCS',
    orderLevel: 3,
    genderEligibility: 'female',
    prerequisiteRankId: 'rank_lady_leader',
    prerequisiteRankName: 'Lady Leader',
    minimumYearsInCurrentRank: 3,
    robingCategory: 'White_Gold',
    liturgicalColor: 'White',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200',
    theologicalRequirements: ['Benevolence Ministry & Almsgiving', 'Widows & Orphans Care', 'Sanctuary Vestment Preparation'],
    description: 'Holy Order of Dorcas, custodians of charity, benevolence, and sacred sanctuary garments.',
    levyBreakdown: {
      branchLevy: 10000,
      districtLevy: 10000,
      provincialLevy: 15000,
      nationalFee: 20000,
      total: 55000,
    },
  },
  {
    id: 'rank_deborah',
    name: 'Deborah',
    shortCode: 'DBH',
    orderLevel: 4,
    genderEligibility: 'female',
    prerequisiteRankId: 'rank_dorcas',
    prerequisiteRankName: 'Dorcas',
    minimumYearsInCurrentRank: 3,
    robingCategory: 'White_Gold',
    liturgicalColor: 'White',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200',
    theologicalRequirements: ['Spiritual Warfare & Intercession', 'Judicial Wisdom & Family Counseling', 'Prophetic Song Ministry'],
    description: 'Holy Order of Deborah, counselors, spiritual judges, and warriors of prayer in Israel.',
    levyBreakdown: {
      branchLevy: 12000,
      districtLevy: 12000,
      provincialLevy: 18000,
      nationalFee: 23000,
      total: 65000,
    },
  },
  {
    id: 'rank_mary',
    name: 'Mary',
    shortCode: 'MRY',
    orderLevel: 5,
    genderEligibility: 'female',
    prerequisiteRankId: 'rank_deborah',
    prerequisiteRankName: 'Deborah',
    minimumYearsInCurrentRank: 3,
    robingCategory: 'White_Gold',
    liturgicalColor: 'White',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 font-bold',
    theologicalRequirements: ['Theology of the Incarnation & Humility', 'Maternal Intercession', 'Sanctuary Sanctification'],
    description: 'Holy Order of Mary, emblems of purity, devotion, and steadfast altar intercession.',
    levyBreakdown: {
      branchLevy: 15000,
      districtLevy: 15000,
      provincialLevy: 20000,
      nationalFee: 30000,
      total: 80000,
    },
  },
  {
    id: 'rank_prophetess',
    name: 'Prophetess',
    shortCode: 'PRP',
    orderLevel: 6,
    genderEligibility: 'female',
    prerequisiteRankId: 'rank_mary',
    prerequisiteRankName: 'Mary',
    minimumYearsInCurrentRank: 4,
    robingCategory: 'Purple_Gold',
    liturgicalColor: 'Purple',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-400 dark:bg-purple-950/60 dark:text-purple-200 font-bold',
    theologicalRequirements: ['Biblical Pneumatology & Prophecy', 'Spiritual Discernment & Visions', 'Order of Holy Mount Vigils'],
    description: 'Holy Order of Prophetess, prophetic oracles, spiritual seers, and prayer vigil leaders.',
    levyBreakdown: {
      branchLevy: 18000,
      districtLevy: 18000,
      provincialLevy: 24000,
      nationalFee: 35000,
      total: 95000,
    },
  },
  {
    id: 'rank_mother_in_israel',
    name: 'Mother in Israel',
    shortCode: 'MII',
    orderLevel: 7,
    genderEligibility: 'female',
    prerequisiteRankId: 'rank_prophetess',
    prerequisiteRankName: 'Prophetess',
    minimumYearsInCurrentRank: 4,
    robingCategory: 'Purple_Gold',
    liturgicalColor: 'Purple',
    badgeColor: 'bg-purple-200 text-purple-950 border-purple-400 dark:bg-purple-900/80 dark:text-purple-100 font-bold',
    theologicalRequirements: ['Matriarchal Ecclesiology', 'Matron Counseling & Family Mediation', 'Sanctuary Protocol Governance'],
    description: 'Matriarch of the Holy Order, advisor on family, counseling, and district prayer altars.',
    levyBreakdown: {
      branchLevy: 20000,
      districtLevy: 20000,
      provincialLevy: 30000,
      nationalFee: 45000,
      total: 115000,
    },
  },
  {
    id: 'rank_senior_mother_in_israel',
    name: 'Snr. Mother in Israel',
    shortCode: 'SMI',
    orderLevel: 8,
    genderEligibility: 'female',
    prerequisiteRankId: 'rank_mother_in_israel',
    prerequisiteRankName: 'Mother in Israel',
    minimumYearsInCurrentRank: 4,
    robingCategory: 'Red_Gold',
    liturgicalColor: 'Crimson',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-950/60 dark:text-rose-200 font-bold',
    theologicalRequirements: ['Provincial Matron Synod Leadership', 'Holy Mount Sacred Ordinances', 'Advanced Ecclesiastical Ethics'],
    description: 'Senior provincial matriarch, custodian of spiritual counsel and provincial women leadership.',
    levyBreakdown: {
      branchLevy: 25000,
      districtLevy: 25000,
      provincialLevy: 35000,
      nationalFee: 55000,
      total: 140000,
    },
  },
  {
    id: 'rank_special_senior_mother_in_israel',
    name: 'Sp. Snr. Mother in Israel',
    shortCode: 'SSMI',
    orderLevel: 9,
    genderEligibility: 'female',
    prerequisiteRankId: 'rank_senior_mother_in_israel',
    prerequisiteRankName: 'Snr. Mother in Israel',
    minimumYearsInCurrentRank: 5,
    robingCategory: 'Red_Gold',
    liturgicalColor: 'Crimson',
    badgeColor: 'bg-rose-200 text-rose-950 border-rose-500 dark:bg-rose-900/90 dark:text-rose-100 font-extrabold shadow-sm',
    theologicalRequirements: ['Supreme Matriarch Council Fellowship', 'Holy Synod Advisory Board Conclave', 'Apex Philanthropic Governance'],
    description: 'Highest matriarchal dignity, apex council member on holy ordinances, advisory to the Supreme Head.',
    levyBreakdown: {
      branchLevy: 30000,
      districtLevy: 30000,
      provincialLevy: 45000,
      nationalFee: 65000,
      total: 170000,
    },
  },
];

export const ESOCS_HIERARCHY: ProvinceHierarchy[] = [
  {
    id: 'prov_lagos_central',
    name: 'Lagos Central Province',
    shortCode: 'LCP',
    districts: [
      {
        id: 'dist_ebute_metta',
        name: 'Ebute Metta District (Apex Mother District)',
        branches: [
          {
            id: 'br_mount_zion_hq',
            name: 'Mount Zion Cathedral Branch (National Headquarters)',
            housesOfPrayer: [
              'Holy Ark Main House of Prayer',
              'Mount Zion General Conclave Sanctuary',
              'St. Moses Orimolade Memorial Chapel',
              'Zion Deliverance Altar',
            ],
          },
          {
            id: 'br_oyingbo',
            name: 'Oyingbo Branch',
            housesOfPrayer: ['Oyingbo Central House of Prayer', 'Adekunle Prayer Altar', 'Coates Sanctuary'],
          },
          {
            id: 'br_coates',
            name: 'Coates Street Branch',
            housesOfPrayer: ['Coates Chapel of Glory', 'Freeman Prayer Center'],
          },
        ],
      },
      {
        id: 'dist_surulere',
        name: 'Surulere District',
        branches: [
          {
            id: 'br_surulere_hq',
            name: 'Surulere Headquarters Cathedral Branch',
            housesOfPrayer: [
              'Mount Zion Main House of Prayer',
              'Bethel Chapel of Praise',
              'Salem Sanctuary of Grace',
              'Moriah House of Deliverance',
            ],
          },
          {
            id: 'br_aguda',
            name: 'Aguda Branch',
            housesOfPrayer: ['Aguda House of Deliverance', 'Peniel Sanctuary of Peace', 'En-Rogel Prayer Altar'],
          },
          {
            id: 'br_itire_ijesha',
            name: 'Itire / Ijesha Branch',
            housesOfPrayer: ['Ijesha House of Grace', 'Itire Altar of Hope', 'Lawanson Chapel'],
          },
        ],
      },
      {
        id: 'dist_lagos_island',
        name: 'Lagos Island / Apapa District',
        branches: [
          {
            id: 'br_lagos_island',
            name: 'Lagos Island Branch (King George)',
            housesOfPrayer: ['King George House of Prayer', 'Isale Eko Chapel of Light', 'Broad Street Sanctuary'],
          },
          {
            id: 'br_apapa_marine',
            name: 'Apapa Marine Branch',
            housesOfPrayer: ['Apapa Sanctuary of Deliverance', 'Wharf Fellowship Chapel'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_lagos_mainland_1',
    name: 'Lagos Mainland 1 Province',
    shortCode: 'LM1',
    districts: [
      {
        id: 'dist_yaba_alagomeji',
        name: 'Yaba / Alagomeji District',
        branches: [
          {
            id: 'br_yaba_central',
            name: 'Yaba Central Cathedral Branch',
            housesOfPrayer: ['Yaba House of Light', 'Commercial Avenue Chapel', 'Tejuosho Prayer Sanctuary'],
          },
          {
            id: 'br_alagomeji',
            name: 'Alagomeji Branch',
            housesOfPrayer: ['Alagomeji Altar of Grace', 'Herbert Macaulay Chapel'],
          },
          {
            id: 'br_onike_iwaya',
            name: 'Onike / Iwaya Branch',
            housesOfPrayer: ['Onike House of Victory', 'Iwaya Prayer Sanctuary'],
          },
          {
            id: 'br_abule_ijesha',
            name: 'Abule Ijesha Branch',
            housesOfPrayer: ['Abule Ijesha Tabernacle', 'Akoka Chapel of Peace'],
          },
        ],
      },
      {
        id: 'dist_somolu_palmgrove',
        name: 'Somolu / Palmgrove District',
        branches: [
          {
            id: 'br_somolu_main',
            name: 'Somolu Main Cathedral Branch',
            housesOfPrayer: ['Somolu House of Prayer', 'Bajulaiye Sanctuary of Praise', 'Fagbenro Altar'],
          },
          {
            id: 'br_palmgrove',
            name: 'Palmgrove Branch',
            housesOfPrayer: ['Palmgrove Chapel of Intercession', 'Onipanu Sanctuary'],
          },
          {
            id: 'br_pedro',
            name: 'Pedro / Gbagada Road Branch',
            housesOfPrayer: ['Pedro House of Grace', 'Shipeolu Prayer Center'],
          },
        ],
      },
      {
        id: 'dist_bariga_gbagada',
        name: 'Bariga / Gbagada District',
        branches: [
          {
            id: 'br_bariga_hq',
            name: 'Bariga Headquarters Branch',
            housesOfPrayer: ['Bariga Main House of Prayer', 'Ilaje Sanctuary of Peace', 'Ladi Lak Altar'],
          },
          {
            id: 'br_gbagada_phase1',
            name: 'Gbagada Phase 1 Branch',
            housesOfPrayer: ['Gbagada Sanctuary of Light', 'Medina Prayer Altar', 'Express Chapel'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_lagos_mainland_2',
    name: 'Lagos Mainland 2 Province',
    shortCode: 'LM2',
    districts: [
      {
        id: 'dist_mushin_isolo',
        name: 'Mushin / Isolo District',
        branches: [
          {
            id: 'br_mushin_cathedral',
            name: 'Mushin Central Cathedral Branch',
            housesOfPrayer: ['Mushin Main House of Prayer', 'Palm Avenue Sanctuary', 'Agege Motor Road Chapel'],
          },
          {
            id: 'br_isolo_main',
            name: 'Isolo Central Branch',
            housesOfPrayer: ['Isolo Altar of Deliverance', 'Ajao Estate Chapel of Praise'],
          },
          {
            id: 'br_oshodi',
            name: 'Oshodi Branch',
            housesOfPrayer: ['Oshodi Tabernacle of Praise', 'Mafoluku Chapel of Hope'],
          },
        ],
      },
      {
        id: 'dist_ilasa_okota',
        name: 'Ilasamaja / Okota District',
        branches: [
          {
            id: 'br_ilasa',
            name: 'Ilasamaja Central Branch',
            housesOfPrayer: ['Ilasamaja House of Peace', 'Babalosha Sanctuary'],
          },
          {
            id: 'br_okota',
            name: 'Okota Palace Way Branch',
            housesOfPrayer: ['Okota Chapel of Dominion', 'Ago Palace Sanctuary of Light'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_lagos_western',
    name: 'Lagos Western Province',
    shortCode: 'LWP',
    districts: [
      {
        id: 'dist_ikeja',
        name: 'Ikeja District',
        branches: [
          {
            id: 'br_ikeja_central',
            name: 'Ikeja Central Cathedral Branch',
            housesOfPrayer: ['Ikeja Main House of Prayer', 'Allen Avenue Sanctuary of Praise', 'Opebi Chapel'],
          },
          {
            id: 'br_oregun',
            name: 'Oregun Branch',
            housesOfPrayer: ['Oregun Chapel of Hope', 'Alausa Secretariat Fellowship'],
          },
          {
            id: 'br_maryland',
            name: 'Maryland / Anthony Branch',
            housesOfPrayer: ['Maryland Sanctuary of Deliverance', 'Mende Chapel'],
          },
        ],
      },
      {
        id: 'dist_agege_ifako',
        name: 'Agege / Ifako-Ijaiye District',
        branches: [
          {
            id: 'br_agege_main',
            name: 'Agege Central Branch',
            housesOfPrayer: ['Agege House of Mercy', 'Pen Cinema Prayer Center', 'Dopemu Altar'],
          },
          {
            id: 'br_ogba',
            name: 'Ogba / Ijaiye Branch',
            housesOfPrayer: ['Ogba Sanctuary of Light', 'College Road Chapel'],
          },
        ],
      },
      {
        id: 'dist_alimosho_egbeda',
        name: 'Alimosho / Egbeda District',
        branches: [
          {
            id: 'br_egbeda',
            name: 'Egbeda / Idimu Branch',
            housesOfPrayer: ['Egbeda House of Prayer', 'Idimu Altar of Grace', 'Akowonjo Chapel'],
          },
          {
            id: 'br_ipaja',
            name: 'Ipaja / Ayobo Branch',
            housesOfPrayer: ['Ipaja Tabernacle of Faith', 'Ayobo Sanctuary'],
          },
          {
            id: 'br_ikotun',
            name: 'Ikotun / Igando Branch',
            housesOfPrayer: ['Ikotun House of Deliverance', 'Igando Altar of Victory'],
          },
        ],
      },
      {
        id: 'dist_ikorodu',
        name: 'Ikorodu District',
        branches: [
          {
            id: 'br_ikorodu_central',
            name: 'Ikorodu Central Cathedral Branch',
            housesOfPrayer: ['Ikorodu Main House of Prayer', 'Agric Sanctuary of Peace', 'Ogutute Chapel'],
          },
          {
            id: 'br_igbogbo',
            name: 'Igbogbo / Ebute Ikorodu Branch',
            housesOfPrayer: ['Igbogbo Chapel of Praise', 'Offin Altar of Grace'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_lagos_eastern_lekki',
    name: 'Lagos Eastern / Lekki-Epe Province',
    shortCode: 'LEP',
    districts: [
      {
        id: 'dist_lekki_vi',
        name: 'Victoria Island / Lekki District',
        branches: [
          {
            id: 'br_lekki_phase1',
            name: 'Lekki Phase 1 Branch',
            housesOfPrayer: ['Lekki Sanctuary of Glory', 'Admiralty House of Prayer', 'Chevy View Chapel'],
          },
          {
            id: 'br_vi_main',
            name: 'Victoria Island Branch',
            housesOfPrayer: ['V.I. Altar of Grace', 'Adeola Odeku Sanctuary'],
          },
          {
            id: 'br_ajah',
            name: 'Ajah / Sangotedo Branch',
            housesOfPrayer: ['Ajah House of Faith', 'Sangotedo Sanctuary of Light', 'Ado Road Chapel'],
          },
        ],
      },
      {
        id: 'dist_epe_ibeju',
        name: 'Epe / Ibeju District',
        branches: [
          {
            id: 'br_epe_central',
            name: 'Epe Central Branch',
            housesOfPrayer: ['Epe House of Prayer', 'Marina Sanctuary'],
          },
          {
            id: 'br_ibeju',
            name: 'Ibeju-Lekki Branch',
            housesOfPrayer: ['Ibeju Altar of Praise', 'Eleko Chapel'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_ogun',
    name: 'Ogun State Province',
    shortCode: 'OGP',
    districts: [
      {
        id: 'dist_abeokuta',
        name: 'Abeokuta Central District',
        branches: [
          {
            id: 'br_abeokuta_cathedral',
            name: 'Abeokuta Cathedral Branch',
            housesOfPrayer: ['Olumo House of Prayer', 'Ibara Sanctuary of Praise', 'Asero Chapel'],
          },
          {
            id: 'br_sapon',
            name: 'Sapon / Itoku Branch',
            housesOfPrayer: ['Sapon Altar of Deliverance', 'Adatan Chapel'],
          },
        ],
      },
      {
        id: 'dist_ota_sango',
        name: 'Ota / Sango District',
        branches: [
          {
            id: 'br_ota_central',
            name: 'Ota Central Branch',
            housesOfPrayer: ['Ota House of Deliverance', 'Iyana Iyesi Chapel', 'Covenant Way Sanctuary'],
          },
          {
            id: 'br_sango',
            name: 'Sango Otta Branch',
            housesOfPrayer: ['Sango Sanctuary of Light', 'Joju Altar of Peace'],
          },
        ],
      },
      {
        id: 'dist_ijebu',
        name: 'Ijebu Ode / Sagamu District',
        branches: [
          {
            id: 'br_ijebu_ode',
            name: 'Ijebu Ode Branch',
            housesOfPrayer: ['Ijebu Central House of Prayer', 'Folagbade Sanctuary'],
          },
          {
            id: 'br_sagamu',
            name: 'Sagamu Branch',
            housesOfPrayer: ['Sagamu Chapel of Praise', 'Akarigbo Altar of Hope'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_western',
    name: 'Western Province (Oyo / Osun / Ondo / Ekiti)',
    shortCode: 'WEP',
    districts: [
      {
        id: 'dist_ibadan',
        name: 'Ibadan Central District',
        branches: [
          {
            id: 'br_ibadan_cathedral',
            name: 'Ibadan Central Cathedral Branch',
            housesOfPrayer: ['Bodija House of Prayer', 'Mokola Sanctuary', 'Agodi Chapel of Praise'],
          },
          {
            id: 'br_ring_road',
            name: 'Ring Road / Dugbe Branch',
            housesOfPrayer: ['Ring Road Chapel of Grace', 'Challenge Sanctuary'],
          },
        ],
      },
      {
        id: 'dist_osogbo',
        name: 'Osogbo District',
        branches: [
          {
            id: 'br_osogbo_central',
            name: 'Osogbo Central Branch',
            housesOfPrayer: ['Osogbo House of Deliverance', 'Oja Oba Sanctuary'],
          },
        ],
      },
      {
        id: 'dist_akure',
        name: 'Akure District',
        branches: [
          {
            id: 'br_akure_cathedral',
            name: 'Akure Central Cathedral',
            housesOfPrayer: ['Akure Main House of Prayer', 'Alagbaka Chapel of Grace'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_niger_delta',
    name: 'Niger Delta Province (Rivers / Bayelsa)',
    shortCode: 'NDP',
    districts: [
      {
        id: 'dist_port_harcourt',
        name: 'Port Harcourt Central District',
        branches: [
          {
            id: 'br_ph_cathedral',
            name: 'Port Harcourt Cathedral Branch',
            housesOfPrayer: ['Trans-Amadi House of Prayer', 'GRA Sanctuary of Praise', 'Garrison Chapel'],
          },
          {
            id: 'br_diobu',
            name: 'Diobu Mile 1 Branch',
            housesOfPrayer: ['Diobu Altar of Deliverance', 'Ikwerre Road Chapel'],
          },
          {
            id: 'br_rumuokoro',
            name: 'Rumuokoro Branch',
            housesOfPrayer: ['Rumuokoro Chapel of Light', 'Choba Altar of Grace'],
          },
        ],
      },
      {
        id: 'dist_yenagoa',
        name: 'Bayelsa / Yenagoa District',
        branches: [
          {
            id: 'br_yenagoa_central',
            name: 'Yenagoa Central Branch',
            housesOfPrayer: ['Yenagoa House of Prayer', 'Swali Sanctuary of Peace'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_eastern',
    name: 'Eastern Province (Enugu / Imo / Abia / Anambra)',
    shortCode: 'EAP',
    districts: [
      {
        id: 'dist_enugu',
        name: 'Enugu Central District',
        branches: [
          {
            id: 'br_enugu_cathedral',
            name: 'Enugu Central Cathedral Branch',
            housesOfPrayer: ['Independence Layout House of Prayer', 'Ogui Sanctuary of Grace'],
          },
        ],
      },
      {
        id: 'dist_aba_owerri',
        name: 'Aba / Owerri District',
        branches: [
          {
            id: 'br_aba_central',
            name: 'Aba Central Branch',
            housesOfPrayer: ['Aba Main House of Prayer', 'Faulks Road Chapel'],
          },
          {
            id: 'br_owerri_central',
            name: 'Owerri Central Branch',
            housesOfPrayer: ['Owerri Sanctuary of Grace', 'Wetheral Road Chapel'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_edo_delta',
    name: 'Edo / Delta Province',
    shortCode: 'EDP',
    districts: [
      {
        id: 'dist_benin',
        name: 'Benin Central District',
        branches: [
          {
            id: 'br_benin_cathedral',
            name: 'Benin Central Cathedral Branch',
            housesOfPrayer: ['Ring Road House of Prayer', 'Uselu Sanctuary of Praise'],
          },
        ],
      },
      {
        id: 'dist_warri_asaba',
        name: 'Warri / Asaba District',
        branches: [
          {
            id: 'br_warri_central',
            name: 'Warri Central Branch',
            housesOfPrayer: ['Warri Main House of Deliverance', 'Effurun Sanctuary'],
          },
          {
            id: 'br_asaba_central',
            name: 'Asaba Central Branch',
            housesOfPrayer: ['Asaba Chapel of Grace', 'Nnebisi Sanctuary'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_northern_fct',
    name: 'Northern & FCT Abuja Province',
    shortCode: 'NAP',
    districts: [
      {
        id: 'dist_fct_abuja',
        name: 'Abuja FCT Central District',
        branches: [
          {
            id: 'br_abuja_cathedral',
            name: 'Abuja Central Cathedral (Maitama/Garki)',
            housesOfPrayer: [
              'Zion Gate Abuja House of Prayer',
              'Garki Altar of Deliverance',
              'Wuse Sanctuary of Peace',
              'Maitama Apex Chapel',
            ],
          },
          {
            id: 'br_kubwa_bwari',
            name: 'Kubwa / Bwari Branch',
            housesOfPrayer: ['Kubwa House of Praise', 'Bwari Chapel of Light'],
          },
          {
            id: 'br_gwagwalada',
            name: 'Gwagwalada Branch',
            housesOfPrayer: ['Gwagwalada Chapel of Grace', 'University Sanctuary'],
          },
        ],
      },
      {
        id: 'dist_kaduna_kano',
        name: 'Kaduna / Kano / Jos District',
        branches: [
          {
            id: 'br_kaduna_central',
            name: 'Kaduna Central Branch',
            housesOfPrayer: ['Kaduna House of Prayer', 'Barnawa Sanctuary of Peace'],
          },
          {
            id: 'br_jos_cathedral',
            name: 'Jos Central Cathedral',
            housesOfPrayer: ['Jos Main House of Prayer', 'Bukuru Chapel'],
          },
          {
            id: 'br_kano_central',
            name: 'Kano Central Branch',
            housesOfPrayer: ['Sabon Gari House of Prayer', 'Airport Road Altar'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_uk_europe',
    name: 'United Kingdom & Europe Diocese',
    shortCode: 'UKE',
    districts: [
      {
        id: 'dist_london',
        name: 'London District',
        branches: [
          {
            id: 'br_london_cathedral',
            name: 'London Central Cathedral (Camberwell/Peckham)',
            housesOfPrayer: [
              'London Mount Zion House of Prayer',
              'Peckham Sanctuary of Grace',
              'Old Kent Road Chapel',
            ],
          },
          {
            id: 'br_north_london',
            name: 'North London Branch (Tottenham)',
            housesOfPrayer: ['Tottenham Chapel of Deliverance', 'Edmonton Sanctuary'],
          },
        ],
      },
      {
        id: 'dist_uk_provinces',
        name: 'Manchester / Birmingham District',
        branches: [
          {
            id: 'br_manchester',
            name: 'Manchester Branch',
            housesOfPrayer: ['Manchester Sanctuary of Praise', 'Salford Chapel'],
          },
          {
            id: 'br_birmingham',
            name: 'Birmingham Branch',
            housesOfPrayer: ['Birmingham House of Prayer', 'Aston Sanctuary'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_north_america',
    name: 'North America Diocese (USA & Canada)',
    shortCode: 'NAD',
    districts: [
      {
        id: 'dist_tri_state',
        name: 'New York / Tri-State District',
        branches: [
          {
            id: 'br_new_york_cathedral',
            name: 'New York Central Cathedral (Brooklyn)',
            housesOfPrayer: [
              'Brooklyn Mount Zion House of Prayer',
              'Queens Sanctuary of Light',
              'Flatbush Chapel',
            ],
          },
          {
            id: 'br_new_jersey',
            name: 'New Jersey Branch (Newark)',
            housesOfPrayer: ['Newark Chapel of Praise', 'Irvington Altar'],
          },
        ],
      },
      {
        id: 'dist_texas',
        name: 'Texas / Houston District',
        branches: [
          {
            id: 'br_houston_central',
            name: 'Houston Central Branch',
            housesOfPrayer: ['Houston House of Deliverance', 'Sugar Land Sanctuary of Peace'],
          },
          {
            id: 'br_dallas',
            name: 'Dallas / Fort Worth Branch',
            housesOfPrayer: ['Dallas Chapel of Grace', 'Arlington Sanctuary'],
          },
        ],
      },
      {
        id: 'dist_canada',
        name: 'Canada District (Toronto)',
        branches: [
          {
            id: 'br_toronto_central',
            name: 'Toronto Central Branch',
            housesOfPrayer: ['Toronto House of Prayer', 'Scarborough Sanctuary'],
          },
        ],
      },
    ],
  },
  {
    id: 'prov_diaspora_west_africa',
    name: 'Rest of Africa & Diaspora Diocese',
    shortCode: 'RAD',
    districts: [
      {
        id: 'dist_west_africa',
        name: 'West Africa Zonal District',
        branches: [
          {
            id: 'br_accra_central',
            name: 'Accra Central Branch (Ghana)',
            housesOfPrayer: ['Accra Mount Zion House of Prayer', 'Tema Sanctuary'],
          },
          {
            id: 'br_cotonou',
            name: 'Cotonou Central Branch (Benin)',
            housesOfPrayer: ['Cotonou House of Prayer', 'Porto-Novo Sanctuary'],
          },
        ],
      },
    ],
  },
];

export const ESOCS_PROVINCES = ESOCS_HIERARCHY.map((p) => p.name);

export function getDistrictsForProvince(provinceName: string): DistrictHierarchy[] {
  const found = ESOCS_HIERARCHY.find((p) => p.name === provinceName);
  return found?.districts || [];
}

export function getAllBranchesForProvince(provinceName: string): Array<{
  id: string;
  name: string;
  districtName: string;
  housesOfPrayer: string[];
}> {
  const districts = getDistrictsForProvince(provinceName);
  const list: Array<{ id: string; name: string; districtName: string; housesOfPrayer: string[] }> = [];
  for (const d of districts) {
    for (const b of d.branches) {
      list.push({
        id: b.id,
        name: b.name,
        districtName: d.name,
        housesOfPrayer: b.housesOfPrayer || [],
      });
    }
  }
  return list;
}

export function getBranchesForDistrict(provinceName: string, districtName: string): ParishBranch[] {
  const districts = getDistrictsForProvince(provinceName);
  const found = districts.find((d) => d.name === districtName);
  return found?.branches || [];
}

export function getHousesOfPrayerForBranch(
  provinceName: string,
  districtName: string,
  branchName: string
): string[] {
  const branches = getBranchesForDistrict(provinceName, districtName);
  const found = branches.find((b) => b.name === branchName);
  return found?.housesOfPrayer || [];
}

export const VETTING_TIERS = [
  { id: 'branch', label: 'Branch / Parish Level', description: 'Parish Priest verification of baptism, tithing, marriage & local church attendance' },
  { id: 'district', label: 'District Level', description: 'District Overseer vetting & quota approval' },
  { id: 'province', label: 'Provincial Level', description: 'Provincial Secretariat verification & zonal credentials review' },
  { id: 'cmc', label: 'CMC Level (National Screening)', description: 'Church Management Council doctrinal examination & oral interview' },
  { id: 'national', label: 'National / Holy Synod', description: 'Supreme ratification by His Most Eminence & Advisory Board of Elders' },
];

export const PASSING_EXAM_CUTOFF = 70;
export const PASSING_INTERVIEW_CUTOFF = 75;
export const MIN_ATTENDANCE_PERCENTAGE = 85;
