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

// Yeni yazı ekleme: import et + bu listeye ekle (en yeni en üstte)
export const allPosts: BlogPost[] = [
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
