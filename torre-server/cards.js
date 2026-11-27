'use strict';
const CARDS={};
function def(id,name,cost,type,rar,cls,p,up){CARDS[id]={id,name,cost,type,rar,cls,...p,up:up||{}};}
def('g_strike','Golpe',1,'atk','s','g',{dmg:6,art:'🗡️'},{dmg:9});
def('g_def','Defender',1,'skill','s','g',{blk:5,art:'🛡️'},{blk:8});
def('g_bash','Esmagar',2,'atk','s','g',{dmg:8,vuln:2,art:'🔨'},{dmg:10,vuln:3});
def('g_twin','Golpe Duplo',1,'atk','c','g',{dmg:4,hits:2,art:'⚔️'},{dmg:5});
def('g_firm','Postura Firme',1,'skill','c','g',{blk:6,retain:true,art:'🧱'},{blk:9});
def('g_cleave','Varredura',1,'atk','c','g',{dmg:8,aoe:true,art:'🌀'},{dmg:11});
def('g_fist','Punho de Ferro',1,'atk','c','g',{dmg:7,strip:true,art:'👊'},{dmg:10});
def('g_blood','Bênção Protetora',0,'skill','c','g',{gblk:4,holy:true,art:'✨'},{gblk:6});
def('g_slam','Golpe de Escudo',1,'atk','u','g',{bodyslam:true,art:'🛡️'},{cost:0});
def('g_roar','Rugido',1,'skill','u','g',{weak:2,aoe:true,gblk:3,holy:true,art:'🦁'},{weak:3,gblk:4});
def('g_heavy','Machadada',2,'atk','u','g',{dmg:12,strip:true,stripdmg:true,art:'🪓'},{dmg:16});
def('g_plate','Armadura Viva',1,'power','u','g',{power:'plated',amt:2,art:'⚙️'},{amt:3});
def('g_oath','Juramento do Escudo',2,'power','r','g',{power:'keep',amt:1,art:'📜'},{cost:1});
def('g_fort','Bastião',2,'skill','r','g',{gblk:18,retain:true,exhaust:true,holy:true,art:'🏰'},{gblk:24});
def('g_pal_conv','Converter Armadura',1,'atk','u','g',{bodyslam:true,bmul:1.5,spend:true,art:'⚔️'},{bmul:2});
def('g_pal_cabeca','Cabeçada de Escudo',1,'atk','c','g',{bodyslam:true,bmul:.5,dmg:4,art:'🪖'},{dmg:6});
def('g_pal_quebra','Quebra-Escudo',1,'atk','c','g',{dmg:5,aoe:true,strip:true,art:'💥'},{dmg:7});
def('g_pal_muralha','Muralha Compartilhada',2,'skill','u','g',{gblk:12,holy:true,art:'🧱'},{gblk:16});
def('g_pal_luz','Luz Redentora',1,'skill','u','g',{gblk:5,heal:3,holy:true,art:'🌟'},{gblk:7,heal:4});
def('g_pal_vigil','Vigília',1,'skill','c','g',{blk:8,retain:true,art:'🕯️'},{blk:11});
def('g_pal_martir','Golpe do Mártir',1,'atk','u','g',{dmg:12,sac:.2,holy:true,art:'⚜️'},{dmg:16});
def('g_pal_juizo','Juízo Sagrado',2,'atk','r','g',{bodyslam:true,bmul:1,dmg:10,sac:.2,holy:true,art:'⚖️'},{dmg:14});
def('g_pal_cruzada','Cruzada',3,'atk','r','g',{bodyslam:true,bmul:1,spend:true,aoe:true,strip:true,holy:true,art:'🏹'},{cost:2});
def('g_pal_aureola','Auréola',1,'power','r','g',{power:'halo',amt:4,holy:true,art:'😇'},{amt:6});
def('g_steel','Tempestade de Aço',2,'atk','r','g',{dmg:4,hits:4,art:'🌪️'},{hits:5});
def('m_spark','Faísca',1,'atk','s','m',{dmg:6,art:'⚡'},{dmg:9});
def('m_ward','Barreira',1,'skill','s','m',{blk:5,art:'🔰'},{blk:8});
def('m_focus','Foco Mental',1,'skill','s','m',{draw:2,art:'🧠'},{draw:3});
def('m_ice','Dardo Gélido',1,'atk','s','m',{dmg:5,weak:1,art:'❄️'},{dmg:7,weak:2});
def('m_fire','Bola de Fogo',2,'atk','c','m',{dmg:12,aoe:true,art:'🔥'},{dmg:16});
def('m_chain','Cadeia de Raios',1,'atk','c','m',{dmg:4,aoe:true,art:'🌩️'},{dmg:6});
def('m_missile','Mísseis',1,'atk','c','m',{dmg:3,hits:3,art:'☄️'},{hits:4});
def('m_flash','Lampejo',0,'skill','c','m',{nrg:1,draw:1,exhaust:true,art:'💡'},{exhaust:false});
def('m_frost','Escudo Gélido',1,'skill','c','m',{blk:7,weak:1,art:'🧊'},{blk:10});
def('m_mark','Marca Arcana',1,'skill','c','m',{vuln:2,draw:1,art:'🎯'},{vuln:3});
def('m_nova','Nova',3,'atk','u','m',{dmg:16,aoe:true,art:'💥'},{dmg:22});
def('m_drain','Dreno Vital',2,'atk','u','m',{dmg:12,heal:4,exhaust:true,art:'🩸'},{dmg:15,heal:6});
def('m_aura','Aura Protetora',2,'power','u','m',{power:'plated',amt:3,art:'🔮'},{amt:4});
def('m_mind','Mente Aguçada',2,'power','u','m',{power:'insight',amt:1,art:'👁️'},{cost:1});
def('m_chan','Canalizar',1,'power','r','m',{power:'ritual',amt:1,art:'🌀'},{amt:2});
def('m_meteor','Meteoro',3,'atk','r','m',{dmg:24,aoe:true,exhaust:true,art:'☄️'},{dmg:32});
def('m_time','Dobra Temporal',1,'skill','r','m',{nrg:2,draw:2,exhaust:true,art:'⏳'},{draw:3});
def('g_ev_guard','Guarda Alta',1,'skill','c','g',{blk:7,draw:1,ev:'t1',art:'🛡️'},{blk:10});
def('g_ev_ram','Aríete',2,'atk','u','g',{dmg:14,vuln:1,ev:'t1',art:'🐏'},{dmg:18,vuln:2});
def('g_ev_resolve','Resolução',1,'skill','u','g',{blk:5,str:1,ev:'t1',art:'💠'},{blk:8,str:2});
def('g_bas_muro','Muro de Pedra',2,'skill','u','g',{blk:16,ev:'bastiao',art:'🧱'},{blk:22});
def('g_bas_golpe','Golpe do Escudo',1,'atk','u','g',{bodyslam:true,vuln:1,ev:'bastiao',art:'🛡️'},{vuln:2});
def('g_vin_furia','Golpe Furioso',1,'atk','u','g',{dmg:9,selfdmg:3,ev:'vingador',art:'💢'},{dmg:13});
def('g_vin_cicatriz','Cicatrizes',0,'skill','u','g',{str:1,selfdmg:3,exhaust:true,ev:'vingador',art:'🩸'},{str:2});
def('g_sig_bast','Fortaleza Viva',2,'power','r','g',{power:'plated',amt:6,ev:'sig',art:'🏯'},{amt:8});
def('g_sig_ving','Fúria do Veterano',1,'skill','r','g',{str:4,selfdmg:6,exhaust:true,ev:'sig',art:'🔥'},{str:5});
def('m_ev_pulso','Pulso Arcano',1,'atk','c','m',{dmg:7,draw:1,ev:'t1',art:'💫'},{dmg:10});
def('m_ev_eter','Fonte de Éter',0,'skill','u','m',{nrg:1,draw:1,exhaust:true,ev:'t1',art:'🔷'},{draw:2});
def('m_ev_onda','Onda Arcana',2,'atk','u','m',{dmg:12,aoe:true,weak:1,ev:'t1',art:'🌊'},{dmg:16});
def('m_tec_fio','Fio Prateado',0,'atk','u','m',{dmg:3,draw:1,ev:'tecelao',art:'🧵'},{dmg:5});
def('m_tec_trama','Trama de Éter',1,'skill','u','m',{blk:6,draw:1,ev:'tecelao',art:'🕸️'},{blk:9});
def('m_des_raio','Raio Concentrado',2,'atk','u','m',{dmg:18,vuln:2,ev:'destruidor',art:'🔆'},{dmg:24});
def('m_des_surto','Surto de Poder',1,'skill','u','m',{str:2,exhaust:true,ev:'destruidor',art:'⚡'},{str:3});
def('m_sig_tec','Tear de Éter',2,'power','r','m',{power:'insight',amt:2,ev:'sig',art:'🪡'},{amt:3});
def('m_sig_des','Cataclismo',3,'atk','r','m',{dmg:30,aoe:true,vuln:2,exhaust:true,ev:'sig',art:'🌋'},{dmg:40});
def('fo_strike','Golpe Incendiário',1,'atk','s','fo',{dmg:6,art:'🗡️'},{dmg:9});
def('fo_def','Guarda de Guerra',1,'skill','s','fo',{blk:5,art:'🛡️'},{blk:8});
def('fo_charge','Carga',2,'atk','s','fo',{dmg:12,selfdmg:3,art:'🔥'},{dmg:16});
def('fo_blood','Pacto de Sangue',1,'skill','s','fo',{str:2,selfdmg:4,art:'🩸'},{str:3});
def('fo_slash','Corte de Cerco',1,'atk','c','fo',{dmg:4,hits:2,art:'⚔️'},{dmg:5});
def('fo_banner','Estandarte',1,'skill','c','fo',{blk:4,str:1,art:'🚩'},{blk:6});
def('fo_torch','Tocha',0,'atk','c','fo',{dmg:4,selfdmg:1,art:'🔦'},{dmg:6});
def('fo_cannon','Canhão de Cerco',2,'atk','u','fo',{dmg:16,vuln:1,art:'💣'},{dmg:20});
def('fo_rage','Furor',1,'skill','u','fo',{str:3,selfdmg:5,exhaust:true,art:'😡'},{str:4});
def('fo_wave','Bombardeio',2,'atk','u','fo',{dmg:12,aoe:true,art:'💥'},{dmg:16});
def('fo_inferno','Cerco Infernal',3,'atk','r','fo',{dmg:22,aoe:true,vuln:1,exhaust:true,art:'🌋'},{dmg:30});
def('fo_ev_lanca','Lança de Brasa',1,'atk','u','fo',{dmg:8,weak:1,ev:'t1',art:'🔱'},{dmg:11});
def('fo_ev_marcha','Marcha de Guerra',1,'skill','c','fo',{blk:6,draw:1,ev:'t1',art:'🥁'},{blk:9});
def('fo_est_ordem','Ordem de Ataque',0,'skill','u','fo',{str:1,draw:1,exhaust:true,ev:'estandarte',art:'📯'},{draw:2});
def('fo_est_carga','Carga Flamejante',2,'atk','u','fo',{dmg:10,hits:2,ev:'estandarte',art:'🐎'},{dmg:13});
def('fo_sig_est','Senhor da Guerra',2,'power','r','fo',{power:'ritual',amt:2,ev:'sig',art:'👑'},{amt:3});
def('fo_cer_muralha','Muralha de Brasas',1,'skill','u','fo',{blk:10,ev:'cerco',art:'🧱'},{blk:14});
def('fo_cer_meteoro','Chuva de Brasas',2,'atk','u','fo',{dmg:11,aoe:true,vuln:1,ev:'cerco',art:'☄️'},{dmg:15});
def('fo_sig_cer','Ruína do Mundo',3,'atk','r','fo',{dmg:28,aoe:true,vuln:2,weak:1,exhaust:true,ev:'sig',art:'🌑'},{dmg:36});
def('ag_strike','Jato',1,'atk','s','ag',{dmg:6,art:'💧'},{dmg:9});
def('ag_def','Escudo de Névoa',1,'skill','s','ag',{blk:5,art:'🌫️'},{blk:8});
def('ag_spring','Gole de Vida',1,'skill','s','ag',{blk:3,heal:3,art:'🫧'},{blk:4,heal:5});
def('ag_wave','Onda',1,'atk','c','ag',{dmg:8,art:'🌊'},{dmg:11});
def('ag_ripple','Ondulação',0,'skill','c','ag',{blk:3,draw:1,art:'〰️'},{blk:5});
def('ag_rain','Chuva Mansa',1,'skill','c','ag',{heal:5,blk:3,art:'🌧️'},{heal:7,blk:5});
def('ag_tide','Maré Cheia',2,'atk','u','ag',{dmg:14,weak:1,art:'🌊'},{dmg:18});
def('ag_frost','Geada',1,'atk','u','ag',{dmg:6,vuln:1,weak:1,art:'❄️'},{dmg:9});
def('ag_deluge','Dilúvio',2,'atk','u','ag',{dmg:12,aoe:true,weak:1,art:'🌧️'},{dmg:16});
def('ag_source','Nascente Eterna',2,'power','r','ag',{power:'plated',amt:5,art:'⛲'},{amt:7});
def('ag_ev_orvalho','Orvalho Restaurador',1,'skill','c','ag',{heal:8,ev:'t1',art:'💦'},{heal:12});
def('ag_ev_rio','Fôlego do Rio',1,'skill','u','ag',{blk:7,draw:1,ev:'t1',art:'🏞️'},{blk:10});
def('ag_cor_veu','Véu de Água',0,'skill','u','ag',{blk:6,ev:'correnteza',art:'🌫️'},{blk:9});
def('ag_cor_redemoinho','Redemoinho',1,'atk','u','ag',{dmg:7,aoe:true,draw:1,ev:'correnteza',art:'🌀'},{dmg:10});
def('ag_sig_cor','Maré Viva',1,'power','r','ag',{power:'insight',amt:1,ev:'sig',art:'🌊'},{cost:0});
def('ag_nas_fonte','Fonte Curativa',2,'skill','u','ag',{heal:14,blk:6,ev:'nascente',art:'⛲'},{heal:18});
def('ag_nas_batismo','Batismo',1,'skill','u','ag',{blk:8,heal:4,ev:'nascente',art:'🕊️'},{blk:11,heal:6});
def('ag_sig_nas','Maré da Vida',3,'skill','r','ag',{heal:25,blk:15,exhaust:true,ev:'sig',art:'🌊'},{heal:32,blk:20});
def('lu_strike','Golpe Sagrado',1,'atk','s','lu',{dmg:6,art:'✨'},{dmg:9});
def('lu_def','Oração',1,'skill','s','lu',{blk:5,art:'🙏'},{blk:8});
def('lu_smite','Castigo',1,'atk','s','lu',{dmg:5,weak:1,art:'⚡'},{dmg:8,weak:2});
def('lu_halo','Halo',1,'skill','c','lu',{blk:7,art:'😇'},{blk:10});
def('lu_ray','Raio de Luz',1,'atk','c','lu',{dmg:9,art:'🔆'},{dmg:12});
def('lu_vow','Voto',1,'skill','c','lu',{blk:4,draw:1,art:'📿'},{blk:6});
def('lu_judge','Julgamento',2,'atk','u','lu',{dmg:15,vuln:2,art:'⚖️'},{dmg:19,vuln:3});
def('lu_choir','Coro Celestial',2,'skill','u','lu',{blk:12,heal:4,art:'🎶'},{blk:16,heal:6});
def('lu_purify','Purificação',1,'skill','u','lu',{heal:5,draw:1,art:'💫'},{heal:8});
def('lu_dawn','Alvorecer',3,'atk','r','lu',{dmg:18,aoe:true,weak:1,blk:10,art:'🌅'},{dmg:24,blk:14});
def('lu_ev_bencao','Bênção',1,'skill','u','lu',{blk:6,str:1,ev:'t1',art:'🕯️'},{blk:8});
def('lu_ev_chama','Chama Sagrada',1,'atk','c','lu',{dmg:7,heal:2,ev:'t1',art:'🔥'},{dmg:10,heal:3});
def('lu_ev_vigilia','Vigília',0,'skill','u','lu',{blk:4,draw:1,ev:'t1',art:'🌙'},{blk:6});
def('lu_sen_escudo','Escudo da Fé',2,'skill','u','lu',{blk:18,ev:'sentinela',art:'🛡️'},{blk:24});
def('lu_sen_muralha','Muralha Sagrada',1,'skill','u','lu',{blk:9,heal:3,ev:'sentinela',art:'🏰'},{blk:12,heal:5});
def('lu_sig_sen','Santuário',2,'power','r','lu',{power:'plated',amt:7,ev:'sig',art:'⛪'},{amt:9});
def('lu_inq_marca','Marca da Culpa',1,'atk','u','lu',{dmg:6,vuln:1,weak:1,ev:'inquisidor',art:'⛓️'},{dmg:9});
def('lu_inq_fogueira','Fogueira',2,'atk','u','lu',{dmg:17,weak:1,ev:'inquisidor',art:'🔥'},{dmg:22});
def('lu_sig_inq','Sentença Final',2,'atk','r','lu',{dmg:20,vuln:2,exhaust:true,ev:'sig',art:'⚖️'},{dmg:26});
def('tr_strike','Lâmina Sombria',1,'atk','s','tr',{dmg:6,art:'🗡️'},{dmg:9});
def('tr_def','Manto de Sombras',1,'skill','s','tr',{blk:5,art:'🌑'},{blk:8});
def('tr_omen','Mau Agouro',1,'skill','s','tr',{weak:1,vuln:1,blk:3,art:'🦉'},{weak:2,vuln:2});
def('tr_claw','Garras',1,'atk','c','tr',{dmg:4,hits:2,art:'🐾'},{dmg:5});
def('tr_shade','Sombra',0,'atk','c','tr',{dmg:4,art:'👤'},{dmg:6});
def('tr_drain','Dreno',1,'atk','c','tr',{dmg:7,heal:3,art:'🩸'},{dmg:10,heal:4});
def('tr_reap','Ceifa',2,'atk','u','tr',{dmg:14,vuln:2,art:'⚰️'},{dmg:18});
def('tr_sac','Sacrifício',0,'skill','u','tr',{str:2,selfdmg:5,exhaust:true,art:'🕯️'},{str:3});
def('tr_veil','Véu da Morte',1,'skill','u','tr',{blk:8,weak:1,art:'🕸️'},{blk:11});
def('tr_end','Último Suspiro',3,'atk','r','tr',{dmg:28,vuln:2,exhaust:true,art:'💀'},{dmg:36});
def('tr_ev_sussurro','Sussurro Final',1,'atk','u','tr',{dmg:8,heal:2,ev:'t1',art:'🌘'},{dmg:11,heal:3});
def('tr_ev_osso','Armadura de Ossos',1,'skill','u','tr',{blk:8,weak:1,ev:'t1',art:'🦴'},{blk:11});
def('tr_ev_pacto','Pacto de Almas',1,'skill','c','tr',{draw:2,selfdmg:3,ev:'t1',art:'👻'},{draw:3});
def('tr_car_dente','Mordida',1,'atk','u','tr',{dmg:9,heal:4,ev:'carniceiro',art:'🦷'},{dmg:12,heal:6});
def('tr_car_banquete','Banquete',2,'atk','u','tr',{dmg:18,heal:8,ev:'carniceiro',art:'🍖'},{dmg:22,heal:10});
def('tr_sig_car','Sede Eterna',2,'power','r','tr',{power:'ritual',amt:1,ev:'sig',art:'🧛'},{amt:2});
def('tr_mal_praga','Praga',1,'skill','u','tr',{vuln:2,weak:2,ev:'maldito',art:'☠️'},{vuln:3,weak:3});
def('tr_mal_ceifa','Foice Maldita',2,'atk','u','tr',{dmg:10,hits:2,vuln:1,ev:'maldito',art:'🪓'},{dmg:13});
def('tr_sig_mal','Fim dos Tempos',3,'atk','r','tr',{dmg:20,aoe:true,vuln:3,weak:3,exhaust:true,ev:'sig',art:'⏳'},{dmg:28});
const CLS={
 g:{n:'Paladino',e:'🛡️',hp:80,v:'Neutro · Sagrado',d:'Armadura: o Escudo vira dano, pode ser retido e protege aliados. Sacrifique vida para golpear mais forte.',deck:['g_strike','g_strike','g_strike','g_strike','g_def','g_def','g_def','g_def','g_bash','g_firm']},
 m:{n:'Mago Arcano',e:'🔮',hp:65,v:'Ar',d:'Frágil, mas rápido. Compra de cartas, energia e dano em área.',deck:['m_spark','m_spark','m_spark','m_spark','m_ward','m_ward','m_ward','m_ward','m_focus','m_ice']},
 fo:{n:'Arauto da Guerra',e:'🔥',hp:78,v:'Fogo',d:'Agressão e sacrifício: gasta vida para golpear mais forte.',deck:['fo_strike', 'fo_strike', 'fo_strike', 'fo_strike', 'fo_def', 'fo_def', 'fo_def', 'fo_def', 'fo_charge', 'fo_blood']},
 ag:{n:'Sacerdote das Marés',e:'💧',hp:84,v:'Água',d:'Cura e fluxo: resiste ao longo do tempo e mantém o ritmo.',deck:['ag_strike', 'ag_strike', 'ag_strike', 'ag_strike', 'ag_def', 'ag_def', 'ag_def', 'ag_def', 'ag_spring', 'ag_spring']},
 lu:{n:'Clérigo da Aurora',e:'✨',hp:82,v:'Luz',d:'Proteção e purificação: ataques que também protegem.',deck:['lu_strike', 'lu_strike', 'lu_strike', 'lu_strike', 'lu_def', 'lu_def', 'lu_def', 'lu_def', 'lu_smite', 'lu_smite']},
 tr:{n:'Ceifador',e:'🌑',hp:74,v:'Sombrio',d:'Risco e recompensa: drena vida e castiga o inimigo.',deck:['tr_strike', 'tr_strike', 'tr_strike', 'tr_strike', 'tr_def', 'tr_def', 'tr_def', 'tr_def', 'tr_omen', 'tr_omen']}
};
const EVO={
 g:{t1:{n:'Postura Firme',d:'Começa cada combate com 8 de Escudo.',fx:{blk0:8}},
  trails:{
   bastiao:{n:'Bastião',e:'🏰',d:'Defesa total: o escudo que sobra não se perde.',
    t2:{n:'Muralha Viva',d:'Mantém 50% do Escudo no turno seguinte e ganha 5 de Escudo no fim do turno.',fx:{keep:.5,plated:5}},t3:{n:'Inabalável',d:'Mantém 70% do Escudo no turno seguinte e ganha 11 de Escudo no fim do turno.',fx:{keep:.7,plated:11}},sig:'g_sig_bast',cards:['g_bas_muro','g_bas_golpe']},
   vingador:{n:'Vingador',e:'🔥',d:'Cada ferida alimenta a fúria.',
    t2:{n:'Sangue Quente',d:'Ganha 1 Força ao perder vida (até 2 vezes por combate).',fx:{rage:2}},t3:{n:'Fúria Eterna',d:'Ganha 1 Força ao perder vida (até 3 vezes por combate).',fx:{rage:3}},sig:'g_sig_ving',cards:['g_vin_furia','g_vin_cicatriz']}},
  t1cards:['g_ev_guard','g_ev_ram','g_ev_resolve']},
 m:{t1:{n:'Mente Aberta',d:'Compra 3 cartas extras no primeiro turno de cada combate.',fx:{draw0:3}},
  trails:{
   tecelao:{n:'Tecelão',e:'🧵',d:'Fluxo constante de cartas e energia.',
    t2:{n:'Fio de Éter',d:'A cada 3ª carta jogada no turno, ganha 1 de Energia.',fx:{flow:1}},t3:{n:'Tear Infinito',d:'A cada 3ª carta jogada no turno, ganha 1 de Energia e compra 2 cartas. Começa cada combate com 1 de Força.',fx:{flow:3,str0:1}},sig:'m_sig_tec',cards:['m_tec_fio','m_tec_trama']},
   destruidor:{n:'Destruidor',e:'☄️',d:'Poder bruto desde o primeiro golpe.',
    t2:{n:'Fúria Arcana',d:'Começa cada combate com 1 de Força.',fx:{str0:1}},t3:{n:'Cataclismo',d:'Começa cada combate com 2 de Força.',fx:{str0:2}},sig:'m_sig_des',cards:['m_des_raio','m_des_surto']}},
  t1cards:['m_ev_pulso','m_ev_eter','m_ev_onda']},
 fo:{t1:{n:'Sede de Guerra',d:'Ganha 1 Força ao jogar uma carta que custa vida (até 2 vezes por combate).',fx:{selfstr:2}},
  trails:{
   estandarte:{n:'Estandarte',e:'🚩',d:'Guerra em marcha: a Força cresce a cada golpe.',
    t2:{n:'Estandarte Erguido',d:'A cada 3º Ataque jogado no combate, ganha 1 Força.',fx:{atkstr:3}},t3:{n:'Estandarte Hasteado',d:'A cada 2º Ataque jogado no combate, ganha 1 Força. Cartas que custam vida concedem Força até 3 vezes.',fx:{atkstr:2,selfstr:3}},sig:'fo_sig_est',cards:['fo_est_ordem', 'fo_est_carga']},
   cerco:{n:'Cerco',e:'🏹',d:'Enfraquece o inimigo antes de golpear.',
    t2:{n:'Cerco Aberto',d:'Inimigos começam o combate com 3 Vulnerável.',fx:{vulnstart:3}},t3:{n:'Cerco Total',d:'Inimigos começam o combate com 4 Vulnerável.',fx:{vulnstart:4}},sig:'fo_sig_cer',cards:['fo_cer_muralha', 'fo_cer_meteoro']}},
  t1cards:['fo_ev_lanca', 'fo_ev_marcha']},
 ag:{t1:{n:'Maré Calma',d:'Cura 2 HP no fim do seu turno.',fx:{healturn:2}},
  trails:{
   correnteza:{n:'Correnteza',e:'🌊',d:'Ritmo veloz: as primeiras cartas custam menos.',
    t2:{n:'Fluxo Ágil',d:'As duas primeiras cartas de cada turno custam 1 a menos.',fx:{first0:2}},t3:{n:'Fluxo Perfeito',d:'As três primeiras cartas de cada turno custam 1 a menos.',fx:{first0:3}},sig:'ag_sig_cor',cards:['ag_cor_veu', 'ag_cor_redemoinho']},
   nascente:{n:'Nascente',e:'⛲',d:'Cura constante que sustenta a luta.',
    t2:{n:'Nascente Viva',d:'Cura 10 HP no fim do seu turno.',fx:{healturn:10}},t3:{n:'Fonte Inesgotável',d:'Cura 20 HP no fim do seu turno.',fx:{healturn:20}},sig:'ag_sig_nas',cards:['ag_nas_fonte', 'ag_nas_batismo']}},
  t1cards:['ag_ev_orvalho', 'ag_ev_rio']},
 lu:{t1:{n:'Aura Sagrada',d:'Cada Ataque jogado concede 1 de Escudo.',fx:{atkblk:1}},
  trails:{
   sentinela:{n:'Sentinela',e:'🛡️',d:'Cada ataque vira proteção.',
    t2:{n:'Escudo da Fé',d:'Cada Ataque jogado concede 3 de Escudo.',fx:{atkblk:3}},t3:{n:'Muralha de Luz',d:'Cada Ataque concede 4 de Escudo e você mantém 30% do Escudo no turno seguinte.',fx:{atkblk:4,keep:.3}},sig:'lu_sig_sen',cards:['lu_sen_escudo', 'lu_sen_muralha']},
   inquisidor:{n:'Inquisidor',e:'⚖️',d:'Fé que pune: a Força cresce a cada golpe.',
    t2:{n:'Fé Inflamada',d:'A cada 5º Ataque jogado no combate, ganha 1 Força.',fx:{atkstr:5}},t3:{n:'Fé Ardente',d:'A cada 4º Ataque jogado no combate, ganha 1 Força.',fx:{atkstr:4}},sig:'lu_sig_inq',cards:['lu_inq_marca', 'lu_inq_fogueira']}},
  t1cards:['lu_ev_bencao', 'lu_ev_chama', 'lu_ev_vigilia']},
 tr:{t1:{n:'Fome do Fim',d:'Cura 20% do dano causado.',fx:{drain:.2}},
  trails:{
   carniceiro:{n:'Carniceiro',e:'🩸',d:'Devora a vida do inimigo.',
    t2:{n:'Sangue Frio',d:'Cura 40% do dano causado.',fx:{drain:.4}},t3:{n:'Banquete Sombrio',d:'Cura 60% do dano causado.',fx:{drain:.6}},sig:'tr_sig_car',cards:['tr_car_dente', 'tr_car_banquete']},
   maldito:{n:'Maldito',e:'💀',d:'Marca o inimigo com a maldição.',
    t2:{n:'Agouro Funesto',d:'Inimigos começam o combate com 2 Vulnerável.',fx:{vulnstart:2}},t3:{n:'Sentença Negra',d:'Inimigos começam o combate com 3 Vulnerável.',fx:{vulnstart:3}},sig:'tr_sig_mal',cards:['tr_mal_praga', 'tr_mal_ceifa']}},
  t1cards:['tr_ev_sussurro', 'tr_ev_osso', 'tr_ev_pacto']}
};
module.exports={CARDS,CLS,EVO};
