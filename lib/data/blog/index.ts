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

// Yeni yazı ekleme: import et + bu listeye ekle (en yeni en üstte)
export const allPosts: BlogPost[] = [
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
