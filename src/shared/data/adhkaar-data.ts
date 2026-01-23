export type AdhkaarCategory =
	| "awakening"
	| "morning"
	| "after-prayer"
	| "evening"
	| "sleep"
	| "ruqyah"

export interface Adhkar {
	id: string
	category: AdhkaarCategory
	arabic: string
	transliteration?: string
	translation: string
	repetitions?: number
	reference?: string
}

export const adhkaar: Adhkar[] = [
	{
		id: "awakening-1",
		category: "awakening",
		arabic:
			"الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا، وَإِلَيْهِ النُّشُورُ",
		transliteration:
			"Alhamdu lillahi alladhi ahyana ba'da ma amatana, wa ilayhi an-nushur",
		translation:
			"All praise is due to Allah, who has given us life after death, and to Him is the resurrection.",
		reference: "Bukhari",
	},
	{
		id: "awakening-2",
		category: "awakening",
		arabic:
			"لا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفِرْ لِي",
		transliteration:
			"La ilaha illa Allahu wahdahu la sharika lah, lahu al-mulku wa lahu al-hamdu, wa huwa 'ala kulli shay'in qadir, subhan Allah, wal-hamdu lillah, wa la ilaha illa Allah, wallahu akbar, wa la hawla wa la quwwata illa billahi al-'aliyyi al-'azim, rabbi ighfir li",
		translation:
			"There is no god but Allah, alone, without partner. To Him belongs sovereignty and to Him belongs praise, and He is over all things competent. Glory be to Allah, and praise be to Allah, and there is no god but Allah, and Allah is the greatest, and there is no might nor any power except with Allah, the Most High, the Most Great. My Lord, forgive me.",
		reference: "Bukhari & Muslim",
	},
	{
		id: "awakening-3",
		category: "awakening",
		arabic:
			"الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ",
		transliteration:
			"Alhamdu lillahi alladhi 'afani fi jasadi, wa radda 'alayya ruhi, wa adhina li bi dhikrih",
		translation:
			"All praise is due to Allah, who has given me well-being in my body, and returned my soul to me, and permitted me to remember Him.",
		reference: "Tirmidhi",
	},
	{
		id: "morning-1",
		category: "morning",
		arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
		transliteration: "A'udhu billahi min ash-shaytani ar-rajim",
		translation: "I seek refuge in Allah from Satan, the rejected.",
	},
	{
		id: "morning-2",
		category: "morning",
		arabic:
			"اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
		transliteration:
			"Allahu la ilaha illa huwa al-hayyu al-qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fi as-samawati wa ma fi al-ard, man dha alladhi yashfa'u 'indahu illa bi idhnih, ya'lamu ma bayna aydayhim wa ma khalfahum, wa la yuhituna bi shay'in min 'ilmihi illa bi ma sha', wasi'a kursiyyuhu as-samawati wa al-ard, wa la ya'uduhu hifzuhuma, wa huwa al-'aliyyu al-'azim",
		translation:
			"Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
		reference: "Quran 2:255 (Ayat al-Kursi)",
	},
	{
		id: "morning-3",
		category: "morning",
		arabic:
			"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ\nاللَّهُ الصَّمَدُ\nلَمْ يَلِدْ وَلَمْ يُولَدْ\nوَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
		transliteration:
			"Bismillahi ar-Rahmani ar-Rahim\nQul huwa Allahu ahad\nAllahu as-samad\nLam yalid wa lam yulad\nWa lam yakun lahu kufuwan ahad",
		translation:
			"In the name of Allah, the Most Gracious, the Most Merciful.\nSay, 'He is Allah, [who is] One,\nAllah, the Eternal Refuge.\nHe neither begets nor is born,\nNor is there to Him any equivalent.'",
		reference: "Quran 112 (Surah Al-Ikhlas)",
	},
	{
		id: "morning-4",
		category: "morning",
		arabic:
			"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ\nمِن شَرِّ مَا خَلَقَ\nوَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ\nوَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ\nوَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
		transliteration:
			"Bismillahi ar-Rahmani ar-Rahim\nQul a'udhu bi rabbi al-falaq\nMin sharri ma khalaq\nWa min sharri ghasiqin idha waqab\nWa min sharri an-naffathati fi al-'uqad\nWa min sharri hasidin idha hasad",
		translation:
			"In the name of Allah, the Most Gracious, the Most Merciful.\nSay, 'I seek refuge in the Lord of daybreak\nFrom the evil of that which He created\nAnd from the evil of darkness when it settles\nAnd from the evil of the blowers in knots\nAnd from the evil of an envier when he envies.'",
		reference: "Quran 113 (Surah Al-Falaq)",
	},
	{
		id: "morning-5",
		category: "morning",
		arabic:
			"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ\nمَلِكِ النَّاسِ\nإِلَٰهِ النَّاسِ\nمِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ\nالَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ\nمِنَ الْجِنَّةِ وَالنَّاسِ",
		transliteration:
			"Bismillahi ar-Rahmani ar-Rahim\nQul a'udhu bi rabbi an-nas\nMaliki an-nas\nIlahi an-nas\nMin sharri al-waswasi al-khannas\nAlladhi yuwaswisu fi suduri an-nas\nMina al-jinnati wa an-nas",
		translation:
			"In the name of Allah, the Most Gracious, the Most Merciful.\nSay, 'I seek refuge in the Lord of mankind,\nThe Sovereign of mankind,\nThe God of mankind,\nFrom the evil of the retreating whisperer\nWho whispers [evil] into the breasts of mankind\nFrom among the jinn and mankind.'",
		reference: "Quran 114 (Surah An-Nas)",
	},
	{
		id: "evening-1",
		category: "evening",
		arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
		transliteration: "A'udhu billahi min ash-shaytani ar-rajim",
		translation: "I seek refuge in Allah from Satan, the rejected.",
	},
	{
		id: "evening-2",
		category: "evening",
		arabic:
			"اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
		transliteration:
			"Allahu la ilaha illa huwa al-hayyu al-qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fi as-samawati wa ma fi al-ard, man dha alladhi yashfa'u 'indahu illa bi idhnih, ya'lamu ma bayna aydayhim wa ma khalfahum, wa la yuhituna bi shay'in min 'ilmihi illa bi ma sha', wasi'a kursiyyuhu as-samawati wa al-ard, wa la ya'uduhu hifzuhuma, wa huwa al-'aliyyu al-'azim",
		translation:
			"Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
		reference: "Quran 2:255 (Ayat al-Kursi)",
	},
	{
		id: "evening-3",
		category: "evening",
		arabic:
			"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ\nاللَّهُ الصَّمَدُ\nلَمْ يَلِدْ وَلَمْ يُولَدْ\nوَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
		transliteration:
			"Bismillahi ar-Rahmani ar-Rahim\nQul huwa Allahu ahad\nAllahu as-samad\nLam yalid wa lam yulad\nWa lam yakun lahu kufuwan ahad",
		translation:
			"In the name of Allah, the Most Gracious, the Most Merciful.\nSay, 'He is Allah, [who is] One,\nAllah, the Eternal Refuge.\nHe neither begets nor is born,\nNor is there to Him any equivalent.'",
		reference: "Quran 112 (Surah Al-Ikhlas)",
	},
	{
		id: "evening-4",
		category: "evening",
		arabic:
			"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ\nمِن شَرِّ مَا خَلَقَ\nوَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ\nوَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ\nوَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
		transliteration:
			"Bismillahi ar-Rahmani ar-Rahim\nQul a'udhu bi rabbi al-falaq\nMin sharri ma khalaq\nWa min sharri ghasiqin idha waqab\nWa min sharri an-naffathati fi al-'uqad\nWa min sharri hasidin idha hasad",
		translation:
			"In the name of Allah, the Most Gracious, the Most Merciful.\nSay, 'I seek refuge in the Lord of daybreak\nFrom the evil of that which He created\nAnd from the evil of darkness when it settles\nAnd from the evil of the blowers in knots\nAnd from the evil of an envier when he envies.'",
		reference: "Quran 113 (Surah Al-Falaq)",
	},
	{
		id: "evening-5",
		category: "evening",
		arabic:
			"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ\nمَلِكِ النَّاسِ\nإِلَٰهِ النَّاسِ\nمِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ\nالَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ\nمِنَ الْجِنَّةِ وَالنَّاسِ",
		transliteration:
			"Bismillahi ar-Rahmani ar-Rahim\nQul a'udhu bi rabbi an-nas\nMaliki an-nas\nIlahi an-nas\nMin sharri al-waswasi al-khannas\nAlladhi yuwaswisu fi suduri an-nas\nMina al-jinnati wa an-nas",
		translation:
			"In the name of Allah, the Most Gracious, the Most Merciful.\nSay, 'I seek refuge in the Lord of mankind,\nThe Sovereign of mankind,\nThe God of mankind,\nFrom the evil of the retreating whisperer\nWho whispers [evil] into the breasts of mankind\nFrom among the jinn and mankind.'",
		reference: "Quran 114 (Surah An-Nas)",
	},
]

export function getAdhkaarByCategory(category: AdhkaarCategory): Adhkar[] {
	return adhkaar.filter(a => a.category === category)
}

export function getAdhkarById(id: string): Adhkar | undefined {
	return adhkaar.find(a => a.id === id)
}
