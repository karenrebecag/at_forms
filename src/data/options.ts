import type { SelectOption } from "../core/types";

function regionFlag(iso2: string): string {
  return [...iso2.toUpperCase()].map(c => {
    const cp = c.codePointAt(0);
    return cp !== undefined ? String.fromCodePoint(cp + 127397) : "";
  }).join("");
}

const DIAL_TO_ISO2: Record<string, string> = {
  "1":"US","1-242":"BS","1-246":"BB","1-264":"AI","1-268":"AG","1-284":"VG","1-340":"VI",
  "1-345":"KY","1-441":"BM","1-473":"GD","1-649":"TC","1-664":"MS","1-670":"MP","1-671":"GU",
  "1-684":"AS","1-721":"SX","1-758":"LC","1-767":"DM","1-784":"VC","1-787":"PR","1-809":"DO",
  "1-868":"TT","1-869":"KN","1-876":"JM","20":"EG","211":"SS","212":"MA","213":"DZ","216":"TN",
  "218":"LY","220":"GM","221":"SN","222":"MR","223":"ML","225":"CI","227":"NE","228":"TG",
  "229":"BJ","230":"MU","231":"LR","232":"SL","233":"GH","234":"NG","235":"TD","236":"CF",
  "237":"CM","238":"CV","239":"ST","240":"GQ","241":"GA","242":"CG","243":"CD","244":"AO",
  "245":"GW","248":"SC","249":"SD","250":"RW","251":"ET","252":"SO","253":"DJ","254":"KE",
  "255":"TZ","256":"UG","257":"BI","258":"MZ","260":"ZM","261":"MG","262":"RE","263":"ZW",
  "264":"NA","265":"MW","266":"LS","267":"BW","268":"SZ","269":"KM","27":"ZA","290":"SH",
  "291":"ER","298":"FO","299":"GL","30":"GR","31":"NL","32":"BE","33":"FR","34":"ES",
  "350":"GI","351":"PT","352":"LU","353":"IE","354":"IS","355":"AL","356":"MT","357":"CY",
  "358":"FI","358-18":"AX","359":"BG","36":"HU","370":"LT","371":"LV","372":"EE","373":"MD",
  "374":"AM","375":"BY","376":"AD","377":"MC","378":"SM","379":"VA","380":"UA","381":"RS",
  "382":"ME","383":"XK","385":"HR","386":"SI","387":"BA","389":"MK","39":"IT","40":"RO",
  "41":"CH","420":"CZ","421":"SK","423":"LI","43":"AT","44":"GB","45":"DK","46":"SE",
  "47":"NO","48":"PL","49":"DE","500":"FK","501":"BZ","502":"GT","503":"SV","504":"HN",
  "505":"NI","506":"CR","507":"PA","508":"PM","509":"HT","51":"PE","52":"MX","53":"CU",
  "54":"AR","55":"BR","56":"CL","57":"CO","58":"VE","590":"GP","591":"BO","592":"GY",
  "593":"EC","594":"GF","595":"PY","596":"MQ","597":"SR","598":"UY","60":"MY","61":"AU",
  "62":"ID","63":"PH","64":"NZ","65":"SG","66":"TH","670":"TL","672-3":"NF","673":"BN",
  "674":"NR","675":"PG","676":"TO","677":"SB","678":"VU","679":"FJ","680":"PW","681":"WF",
  "682":"CK","683":"NU","685":"WS","686":"KI","687":"NC","688":"TV","689":"PF","690":"TK",
  "691":"FM","692":"MH","7":"RU","81":"JP","82":"KR","84":"VN","850":"KP","852":"HK",
  "853":"MO","855":"KH","856":"LA","86":"CN","880":"BD","886":"TW","90":"TR","91":"IN",
  "92":"PK","93":"AF","94":"LK","95":"MM","960":"MV","961":"LB","962":"JO","963":"SY",
  "964":"IQ","965":"KW","966":"SA","967":"YE","968":"OM","970":"PS","971":"AE","972":"IL",
  "973":"BH","974":"QA","975":"BT","976":"MN","977":"NP","98":"IR","992":"TJ","993":"TM",
  "994":"AZ","995":"GE","996":"KG","998":"UZ",
};

// Prefijos telefónicos de país (value = código, label = bandera + +código).
export const DIALLING_CODES: SelectOption[] = [
  "1", "1-242", "1-246", "1-264", "1-268", "1-284", "1-340", "1-345", "1-441", "1-473",
  "1-649", "1-664", "1-670", "1-671", "1-684", "1-721", "1-758", "1-767", "1-784", "1-787",
  "1-809", "1-868", "1-869", "1-876", "20", "211", "212", "213", "216", "218", "220", "221",
  "222", "223", "225", "227", "228", "229", "230", "231", "232", "233", "234", "235", "236",
  "237", "238", "239", "240", "241", "242", "243", "244", "245", "248", "249", "250", "251",
  "252", "253", "254", "255", "256", "257", "258", "260", "261", "262", "263", "264", "265",
  "266", "267", "268", "269", "27", "290", "291", "298", "299", "30", "31", "32", "33", "34",
  "350", "351", "352", "353", "354", "355", "356", "357", "358", "358-18", "359", "36", "370",
  "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383",
  "385", "386", "387", "389", "39", "40", "41", "420", "421", "423", "43", "44", "45", "46",
  "47", "48", "49", "500", "501", "502", "503", "504", "505", "506", "507", "508", "509", "51",
  "52", "53", "54", "55", "56", "57", "58", "590", "591", "592", "593", "594", "595", "596",
  "597", "598", "60", "61", "62", "63", "64", "65", "66", "670", "672-3", "673", "674", "675",
  "676", "677", "678", "679", "680", "681", "682", "683", "685", "686", "687", "688", "689",
  "690", "691", "692", "7", "81", "82", "84", "850", "852", "853", "855", "856", "86", "880",
  "886", "90", "91", "92", "93", "94", "95", "960", "961", "962", "963", "964", "965", "966",
  "967", "968", "970", "971", "972", "973", "974", "975", "976", "977", "98", "992", "993",
  "994", "995", "996", "998",
].map((c) => {
  const iso2 = DIAL_TO_ISO2[c];
  const flag = iso2 ? regionFlag(iso2) : "";
  return { value: c, label: flag ? `${flag} +${c}` : `+${c}` };
});

const ISO3_TO_ISO2: Record<string, string> = {
  AFG:"AF", ALB:"AL", DZA:"DZ", ASM:"AS", AND:"AD", AGO:"AO", AIA:"AI", ATG:"AG",
  ARG:"AR", ARM:"AM", AUS:"AU", AUT:"AT", AZE:"AZ", BHS:"BS", BHR:"BH", BGD:"BD",
  BRB:"BB", BLR:"BY", BEL:"BE", BLZ:"BZ", BEN:"BJ", BMU:"BM", BTN:"BT", VEN:"VE",
  BIH:"BA", BWA:"BW", BVT:"BV", BRA:"BR", BRN:"BN", BGR:"BG", BFA:"BF", BDI:"BI",
  CPV:"CV", KHM:"KH", CMR:"CM", CAN:"CA", CYM:"KY", CAF:"CF", TCD:"TD", CHL:"CL",
  CHN:"CN", COL:"CO", COM:"KM", COK:"CK", CRI:"CR", HRV:"HR", CUB:"CU", CYP:"CY",
  CZE:"CZ", CIV:"CI", PRK:"KP", COD:"CD", DNK:"DK", DJI:"DJ", DMA:"DM", DOM:"DO",
  ECU:"EC", EGY:"EG", SLV:"SV", GNQ:"GQ", ERI:"ER", EST:"EE", SWZ:"SZ", ETH:"ET",
  FLK:"FK", FRO:"FO", FSM:"FM", FJI:"FJ", FIN:"FI", FRA:"FR", GUF:"GF", PYF:"PF",
  ATF:"TF", GAB:"GA", GMB:"GM", GEO:"GE", DEU:"DE", GHA:"GH", GIB:"GI", GRC:"GR",
  GRL:"GL", GRD:"GD", GLP:"GP", GUM:"GU", GTM:"GT", GIN:"GN", GNB:"GW", GUY:"GY",
  HTI:"HT", VAT:"VA", HND:"HN", HKG:"HK", HUN:"HU", ISL:"IS", IND:"IN", IDN:"ID",
  IRN:"IR", IRQ:"IQ", IRL:"IE", ISR:"IL", ITA:"IT", JAM:"JM", JPN:"JP", JOR:"JO",
  KAZ:"KZ", KEN:"KE", KIR:"KI", RKS:"XK", KWT:"KW", KGZ:"KG", LAO:"LA", LVA:"LV",
  LBN:"LB", LSO:"LS", LBR:"LR", LBY:"LY", LIE:"LI", LTU:"LT", LUX:"LU", MAC:"MO",
  MDG:"MG", MWI:"MW", MYS:"MY", MDV:"MV", MLI:"ML", MLT:"MT", MHL:"MH", MTQ:"MQ",
  MRT:"MR", MUS:"MU", MYT:"YT", MEX:"MX", MCO:"MC", MNG:"MN", MNE:"ME", MSR:"MS",
  MAR:"MA", MOZ:"MZ", MMR:"MM", NAM:"NA", NRU:"NR", NPL:"NP", NLD:"NL", NCL:"NC",
  NZL:"NZ", NIC:"NI", NER:"NE", NGA:"NG", NIU:"NU", NFK:"NF", MKD:"MK", MNP:"MP",
  NOR:"NO", OMN:"OM", PAK:"PK", PLW:"PW", PAN:"PA", PNG:"PG", PRY:"PY", PER:"PE",
  PHL:"PH", PCN:"PN", BOL:"BO", POL:"PL", PRT:"PT", PRI:"PR", QAT:"QA", KOR:"KR",
  MDA:"MD", COG:"CG", ROU:"RO", RUS:"RU", RWA:"RW", REU:"RE", BLM:"BL", SHN:"SH",
  KNA:"KN", LCA:"LC", MAF:"MF", SPM:"PM", VCT:"VC", WSM:"WS", SMR:"SM", STP:"ST",
  SAU:"SA", SEN:"SN", SRB:"RS", SYC:"SC", SLE:"SL", SGP:"SG", SXM:"SX", SVK:"SK",
  SVN:"SI", SLB:"SB", SOM:"SO", ZAF:"ZA", SGS:"GS", SSD:"SS", ESP:"ES", LKA:"LK",
  PSE:"PS", SDN:"SD", SUR:"SR", SWE:"SE", CHE:"CH", SYR:"SY", TWN:"TW", TJK:"TJ",
  THA:"TH", TLS:"TL", TGO:"TG", TKL:"TK", TON:"TO", TTO:"TT", TUN:"TN", TUR:"TR",
  TKM:"TM", TCA:"TC", TUV:"TV", UGA:"UG", UKR:"UA", ARE:"AE", GBR:"GB", TZA:"TZ",
  USA:"US", URY:"UY", UZB:"UZ", VUT:"VU", VNM:"VN", VGB:"VG", VIR:"VI", WLF:"WF",
  ESH:"EH", YEM:"YE", ZMB:"ZM", ZWE:"ZW", ALA:"AX",
};

function countryFlag(iso3: string): string {
  const iso2 = ISO3_TO_ISO2[iso3];
  if (!iso2) return "";
  return [...iso2.toUpperCase()].map(c => {
    const cp = c.codePointAt(0);
    return cp !== undefined ? String.fromCodePoint(cp + 127397) : "";
  }).join("");
}

// Inversos de los mapas de arriba para resolver desde un ISO2 (lo que devuelve la geo-IP)
// hacia los valores que usan los selects: country = ISO3, dialling_code = prefijo telefónico.
// Primera coincidencia gana (NANP comparte "1": US queda primero en DIAL_TO_ISO2).
const ISO2_TO_ISO3: Record<string, string> = Object.fromEntries(
  Object.entries(ISO3_TO_ISO2).map(([iso3, iso2]) => [iso2, iso3]),
);
const ISO2_TO_DIAL: Record<string, string> = {};
for (const [dial, iso2] of Object.entries(DIAL_TO_ISO2)) {
  if (!(iso2 in ISO2_TO_DIAL)) ISO2_TO_DIAL[iso2] = dial;
}

// ISO2 (geo-IP) -> value del select de país (ISO3). undefined si no está en la lista.
export function iso3ForIso2(iso2: string): string | undefined {
  return ISO2_TO_ISO3[iso2.toUpperCase()];
}

// ISO2 (geo-IP) -> value del select de prefijo (código telefónico). undefined si no mapea.
export function dialForIso2(iso2: string): string | undefined {
  return ISO2_TO_DIAL[iso2.toUpperCase()];
}

// Países (value = ISO3, label = nombre en español con emoji de bandera).
export const COUNTRIES: SelectOption[] = [
  ["AFG", "Afganistán"], ["ALB", "Albania"], ["DZA", "Argelia"], ["ASM", "Samoa Americana"],
  ["AND", "Andorra"], ["AGO", "Angola"], ["AIA", "Anguila"], ["ATG", "Antigua y Barbuda"],
  ["ARG", "Argentina"], ["ARM", "Armenia"], ["AUS", "Australia"], ["AUT", "Austria"],
  ["AZE", "Azerbaiyán"], ["BHS", "Bahamas"], ["BHR", "Baréin"], ["BGD", "Bangladés"],
  ["BRB", "Barbados"], ["BLR", "Bielorrusia"], ["BEL", "Bélgica"], ["BLZ", "Belice"],
  ["BEN", "Benín"], ["BMU", "Bermudas"], ["BTN", "Bután"], ["VEN", "Venezuela"],
  ["BIH", "Bosnia-Herzegovina"], ["BWA", "Botsuana"], ["BVT", "Isla Bouvet"], ["BRA", "Brasil"],
  ["BRN", "Brunéi"], ["BGR", "Bulgaria"], ["BFA", "Burkina Faso"], ["BDI", "Burundi"],
  ["CPV", "Cabo Verde"], ["KHM", "Camboya"], ["CMR", "Camerún"], ["CAN", "Canadá"],
  ["CYM", "Islas Caimán"], ["CAF", "República Centroafricana"], ["TCD", "Chad"], ["CHL", "Chile"],
  ["CHN", "China"], ["COL", "Colombia"], ["COM", "Comoras"], ["COK", "Islas Cook"],
  ["CRI", "Costa Rica"], ["HRV", "Croacia"], ["CUB", "Cuba"], ["CYP", "Chipre"],
  ["CZE", "República Checa"], ["CIV", "Costa de Marfil"], ["PRK", "Corea del Norte"],
  ["COD", "República Democrática del Congo"], ["DNK", "Dinamarca"], ["DJI", "Yibuti"],
  ["DMA", "Dominica"], ["DOM", "República Dominicana"], ["ECU", "Ecuador"], ["EGY", "Egipto"],
  ["SLV", "El Salvador"], ["GNQ", "Guinea Ecuatorial"], ["ERI", "Eritrea"], ["EST", "Estonia"],
  ["SWZ", "Suazilandia"], ["ETH", "Etiopía"], ["FLK", "Islas Malvinas"], ["FRO", "Islas Feroe"],
  ["FSM", "Micronesia"], ["FJI", "Fiyi"], ["FIN", "Finlandia"], ["FRA", "Francia"],
  ["GUF", "Guayana Francesa"], ["PYF", "Polinesia Francesa"], ["ATF", "Territorios Australes Franceses"],
  ["GAB", "Gabón"], ["GMB", "Gambia"], ["GEO", "Georgia"], ["DEU", "Alemania"], ["GHA", "Ghana"],
  ["GIB", "Gibraltar"], ["GRC", "Grecia"], ["GRL", "Groenlandia"], ["GRD", "Granada"],
  ["GLP", "Guadalupe"], ["GUM", "Guam"], ["GTM", "Guatemala"], ["GIN", "Guinea"],
  ["GNB", "Guinea-Bisáu"], ["GUY", "Guyana"], ["HTI", "Haití"], ["VAT", "Ciudad del Vaticano"],
  ["HND", "Honduras"], ["HKG", "RAE de Hong Kong (China)"], ["HUN", "Hungría"], ["ISL", "Islandia"],
  ["IND", "India"], ["IDN", "Indonesia"], ["IRN", "Irán"], ["IRQ", "Iraq"], ["IRL", "Irlanda"],
  ["ISR", "Israel"], ["ITA", "Italia"], ["JAM", "Jamaica"], ["JPN", "Japón"], ["JOR", "Jordania"],
  ["KAZ", "Kazajistán"], ["KEN", "Kenia"], ["KIR", "Kiribati"], ["RKS", "Kosovo"], ["KWT", "Kuwait"],
  ["KGZ", "Kirguistán"], ["LAO", "Laos"], ["LVA", "Letonia"], ["LBN", "Líbano"], ["LSO", "Lesoto"],
  ["LBR", "Liberia"], ["LBY", "Libia"], ["LIE", "Liechtenstein"], ["LTU", "Lituania"],
  ["LUX", "Luxemburgo"], ["MAC", "RAE de Macao (China)"], ["MDG", "Madagascar"], ["MWI", "Malaui"],
  ["MYS", "Malasia"], ["MDV", "Maldivas"], ["MLI", "Mali"], ["MLT", "Malta"], ["MHL", "Islas Marshall"],
  ["MTQ", "Martinica"], ["MRT", "Mauritania"], ["MUS", "Mauricio"], ["MYT", "Mayotte"], ["MEX", "México"],
  ["MCO", "Mónaco"], ["MNG", "Mongolia"], ["MNE", "Montenegro"], ["MSR", "Montserrat"],
  ["MAR", "Marruecos"], ["MOZ", "Mozambique"], ["MMR", "Myanmar (Birmania)"], ["NAM", "Namibia"],
  ["NRU", "Nauru"], ["NPL", "Nepal"], ["NLD", "Países Bajos"], ["NCL", "Nueva Caledonia"],
  ["NZL", "Nueva Zelanda"], ["NIC", "Nicaragua"], ["NER", "Níger"], ["NGA", "Nigeria"],
  ["NIU", "Isla Niue"], ["NFK", "Isla Norfolk"], ["MKD", "Macedonia"], ["MNP", "Islas Marianas del Norte"],
  ["NOR", "Noruega"], ["OMN", "Omán"], ["PAK", "Pakistán"], ["PLW", "Palau"], ["PAN", "Panamá"],
  ["PNG", "Papúa Nueva Guinea"], ["PRY", "Paraguay"], ["PER", "Perú"], ["PHL", "Filipinas"],
  ["PCN", "Islas Pitcairn"], ["BOL", "Bolivia"], ["POL", "Polonia"], ["PRT", "Portugal"],
  ["PRI", "Puerto Rico"], ["QAT", "Catar"], ["KOR", "Corea del Sur"], ["MDA", "Moldavia"],
  ["COG", "República del Congo"], ["ROU", "Rumanía"], ["RUS", "Rusia"], ["RWA", "Ruanda"],
  ["REU", "Reunión"], ["BLM", "San Bartolomé"], ["SHN", "Santa Elena"], ["KNA", "San Cristóbal y Nieves"],
  ["LCA", "Santa Lucía"], ["MAF", "San Martín"], ["SPM", "San Pedro y Miquelón"],
  ["VCT", "San Vicente y las Granadinas"], ["WSM", "Samoa"], ["SMR", "San Marino"],
  ["STP", "Santo Tomé y Príncipe"], ["SAU", "Arabia Saudí"], ["SEN", "Senegal"], ["SRB", "Serbia"],
  ["SYC", "Seychelles"], ["SLE", "Sierra Leona"], ["SGP", "Singapur"], ["SXM", "Sint Maarten"],
  ["SVK", "Eslovaquia"], ["SVN", "Eslovenia"], ["SLB", "Islas Salomón"], ["SOM", "Somalia"],
  ["ZAF", "Sudáfrica"], ["SGS", "Islas Georgia del Sur y Sandwich del Sur"], ["SSD", "Sudán del Sur"],
  ["ESP", "España"], ["LKA", "Sri Lanka"], ["PSE", "Territorios Palestinos"], ["SDN", "Sudán"],
  ["SUR", "Surinam"], ["SWE", "Suecia"], ["CHE", "Suiza"], ["SYR", "Siria"], ["TWN", "Taiwán"],
  ["TJK", "Tayikistán"], ["THA", "Tailandia"], ["TLS", "Timor Oriental"], ["TGO", "Togo"],
  ["TKL", "Tokelau"], ["TON", "Tonga"], ["TTO", "Trinidad y Tobago"], ["TUN", "Túnez"],
  ["TUR", "Turquía"], ["TKM", "Turkmenistán"], ["TCA", "Islas Turcas y Caicos"], ["TUV", "Tuvalu"],
  ["UGA", "Uganda"], ["UKR", "Ucrania"], ["ARE", "Emiratos Árabes Unidos"], ["GBR", "Reino Unido"],
  ["TZA", "Tanzania"], ["USA", "Estados Unidos"], ["URY", "Uruguay"], ["UZB", "Uzbekistán"],
  ["VUT", "Vanuatu"], ["VNM", "Vietnam"], ["VGB", "Islas Vírgenes Británicas"],
  ["VIR", "Islas Vírgenes de EE. UU."], ["WLF", "Wallis y Futuna"], ["ESH", "Sáhara Occidental"],
  ["YEM", "Yemen"], ["ZMB", "Zambia"], ["ZWE", "Zimbabue"], ["ALA", "Islas Åland"],
].map(([value, label]) => ({ value, label: `${countryFlag(value)} ${label}` }));
