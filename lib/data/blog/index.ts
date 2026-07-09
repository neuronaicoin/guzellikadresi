import type { BlogPost } from './types';
import { post as lazerEpilasyon } from './lazer-epilasyon-rehberi';
import { post as sacEkimi } from './sac-ekimi-rehberi';
import { post as kaliciMakyaj } from './kalici-makyaj-microblading';
import { post as salonMusteri } from './guzellik-salonu-musteri-cekme';
import { post as ciltBakimi } from './profesyonel-cilt-bakimi';
import { post as beylikduzuGuzellik } from './beylikduzu-guzellik-merkezi';
import { post as beylikduzuLazer } from './beylikduzu-lazer-epilasyon';
import { post as beylikduzuSacEkimi } from './beylikduzu-sac-ekimi';
import { post as beylikduzuCiltBakimi } from './beylikduzu-cilt-bakimi';
import { post as beylikduzuSpaMasaj } from './beylikduzu-spa-masaj';
import { post as protezTirnak } from './protez-tirnak-rehberi';
import { post as dovmePiercing } from './dovme-piercing-rehberi';
import { post as pilates } from './pilates-rehberi';
import { post as medikalEstetik } from './medikal-estetik-rehberi';
import { post as erkekKuaforu } from './erkek-kuaforu-rehberi';
import { post as bayanKuaforu } from './bayan-kuaforu-rehberi';
import { post as bolgeselIncelme } from './bolgesel-incelme-rehberi';
import { post as spaMasaj } from './spa-masaj-rehberi';
import { post as solaryum } from './solaryum-rehberi';
import { post as sauna } from './sauna-rehberi';
import { post as bakirkoyTirnak } from './bakirkoy-tirnak-studyosu';
import { post as bakirkoyLazer } from './bakirkoy-lazer-epilasyon';
import { post as bakirkoyGuzellik } from './bakirkoy-guzellik-merkezi';
import { post as bakirkoyMedikal } from './bakirkoy-medikal-estetik';
import { post as sisliMedikal } from './sisli-medikal-estetik';
import { post as sisliSacEkimi } from './sisli-sac-ekimi';
import { post as antalyaGuzellik } from './antalya-guzellik-merkezi';
import { post as antalyaLazer } from './antalya-lazer-epilasyon';
import { post as antalyaMedikal } from './antalya-medikal-estetik';
import { post as izmirGuzellik } from './izmir-guzellik-merkezi';
import { post as izmirLazer } from './izmir-lazer-epilasyon';
import { post as izmirMedikal } from './izmir-medikal-estetik';
import { post as musteriCekmeRehberi } from './guzellik-isletmesi-daha-fazla-musteri-cekme-rehberi';
import { post as konyaRehber } from './konya-guzellik-merkezi-bakim-rehberi';
import { post as konyaLazer } from './konya-lazer-epilasyon-rehberi';
import { post as konyaMedikal } from './konya-medikal-estetik-rehberi';
import { post as bursaRehber } from './bursa-guzellik-merkezi-bakim-rehberi';
import { post as bursaLazer } from './bursa-lazer-epilasyon-rehberi';
import { post as bursaMedikal } from './bursa-medikal-estetik-rehberi';
import { post as ankaraMedikal } from './ankara-medikal-estetik-rehberi';
import { post as ankaraGuzellik } from './ankara-guzellik-merkezi-rehberi';
import { post as samsunLazer } from './samsun-lazer-epilasyon-rehberi';
import { post as samsunMedikal } from './samsun-medikal-estetik-rehberi';
import { post as samsunKuafor } from './samsun-bayan-kuaforu-rehberi';
import { post as gaziantepGuzellik } from './gaziantep-guzellik-merkezi-rehberi';
import { post as kayseriLazer } from './kayseri-lazer-epilasyon-rehberi';
import { post as kayseriGuzellik } from './kayseri-guzellik-merkezi-rehberi';
import { post as kayseriTirnak } from './kayseri-tirnak-studyosu-rehberi';
import { post as mersinMedikal } from './mersin-medikal-estetik-rehberi';
import { post as lazerVsAgda } from './lazer-epilasyon-mu-agda-mi-karsilastirma';
import { post as botoksMuDolgu } from './botoks-mu-dolgu-mu-hangisi-uygun';
import { post as gmSecerken } from './guzellik-merkezi-secerken-sorulacak-sorular';
import { post as gelinHazirligi } from './gelin-hazirligi-bakim-takvimi';
import { post as beylikduzuMusteri } from './beylikduzu-guzellik-bakim-musteri-rehberi';
import { post as izmirMusteri } from './izmir-guzellik-bakim-musteri-rehberi';
import { post as ankaraMusteri } from './ankara-guzellik-bakim-musteri-rehberi';
import { post as bursaMusteri } from './bursa-guzellik-bakim-musteri-rehberi';
import { post as konyaMusteri } from './konya-guzellik-bakim-musteri-rehberi';
import { post as antalyaMusteri } from './antalya-guzellik-bakim-musteri-rehberi';
import { post as orduMusteri } from './ordu-guzellik-bakim-musteri-rehberi';
import { post as istanbulMedikal } from './istanbul-medikal-estetik-rehberi';
import { post as istanbulSacEkimi } from './istanbul-sac-ekimi-rehberi';
import { post as turkiyePillar } from './turkiye-guzellik-bakim-rehberi-ultimate';
import { post as lazerMerkezSecim } from './lazer-epilasyon-merkezi-nasil-secilir';
import { post as sacEkimiMerkezSecim } from './sac-ekimi-merkezi-nasil-secilir';
import { post as buzLazerAlexandrite } from './buz-lazer-mi-alexandrite-mi';
import { post as kaliciMakyajSecim } from './kalici-makyaj-microblading-uzmani-nasil-secilir';
import { post as hydrafacialRehber } from './hydrafacial-nedir-nasil-secilir-rehberi';
import { post as bolgeselIncelmeGercekci } from './bolgesel-incelme-nedir-gercekci-rehber';
import { post as protezTirnakSecim } from './protez-tirnak-guvenli-mi-salon-nasil-secilir';
import { post as sacBotoksuKeratin } from './sac-botoksu-mu-keratin-bakimi-mi-fark-rehberi';
import { post as medikalEstetikSecim } from './medikal-estetik-merkezi-nasil-secilir';
// Yeni yazı ekleme: import et + bu listeye ekle (en yeni en üstte)
export const allPosts: BlogPost[] = [
  medikalEstetikSecim,
  sacBotoksuKeratin,
  protezTirnakSecim,
  bolgeselIncelmeGercekci,
  hydrafacialRehber,
  kaliciMakyajSecim,
  buzLazerAlexandrite,
  sacEkimiMerkezSecim,
  lazerMerkezSecim,
  turkiyePillar,
  istanbulSacEkimi,
  istanbulMedikal,
  orduMusteri,
  antalyaMusteri,
  konyaMusteri,
  bursaMusteri,
  ankaraMusteri,
  izmirMusteri,
  beylikduzuMusteri,
  gelinHazirligi,
  gmSecerken,
  botoksMuDolgu,
  lazerVsAgda,
  mersinMedikal,
  kayseriTirnak,
  kayseriGuzellik,
  kayseriLazer,
  gaziantepGuzellik,
  samsunKuafor,
  samsunMedikal,
  samsunLazer,
  ankaraGuzellik,
  ankaraMedikal,
  bursaMedikal,
  bursaLazer,
  bursaRehber,
  konyaMedikal,
  konyaLazer,
  konyaRehber,
  musteriCekmeRehberi,
  izmirGuzellik,
  izmirLazer,
  izmirMedikal,
  antalyaGuzellik,
  antalyaLazer,
  antalyaMedikal,
  sisliSacEkimi,
  sisliMedikal,
  bakirkoyMedikal,
  bakirkoyGuzellik,
  bakirkoyLazer,
  bakirkoyTirnak,
  sauna,
  solaryum,
  spaMasaj,
  bolgeselIncelme,
  bayanKuaforu,
  erkekKuaforu,
  medikalEstetik,
  pilates,
  dovmePiercing,
  protezTirnak,
  beylikduzuSpaMasaj,
  beylikduzuCiltBakimi,
  beylikduzuGuzellik,
  beylikduzuLazer,
  beylikduzuSacEkimi,
  lazerEpilasyon,
  sacEkimi,
  kaliciMakyaj,
  salonMusteri,
  ciltBakimi,
];
export function getAllPosts(): BlogPost[] {
  return [...allPosts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}
export function getPostBySlug(slug: string): BlogPost | null {
  return allPosts.find((p) => p.slug === slug) || null;
}
export function getRecentPosts(n: number): BlogPost[] {
  return getAllPosts().slice(0, n);
}
