import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Hakkımızda',
  description: "GüzellikAdresi, Türkiye genelinde güzellik ve bakım işletmelerini müşterilerle buluşturan ücretsiz bir rehberdir.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="ga-static-wrap">
        <h1>Hakkımızda</h1>
        <p className="ga-static-lead">Bölgenizdeki en iyi güzellik ve bakım uzmanlarını saniyeler içinde bulmanız için buradayız.</p>

        <h2>Biz Kimiz?</h2>
        <p>GüzellikAdresi, Türkiye genelinde güzellik merkezi, kuaför, medikal estetik, tırnak stüdyosu, saç ekimi ve daha birçok güzellik & bakım hizmetini tek çatı altında buluşturan ücretsiz bir rehberdir. Amacımız, hizmet arayan kişileri bulundukları bölgedeki güvenilir uzmanlarla kolayca buluşturmak.</p>

        <h2>Neden GüzellikAdresi?</h2>
        <p>İnsanlar güzellik ve bakım hizmetini genellikle yaşadıkları bölgede ararlar. Biz de tam olarak buna odaklandık: konuma dayalı, hızlı ve kolay bir keşif deneyimi. Kullanıcılar şehir ve ilçe seçerek yakınlarındaki işletmeleri görür, hizmetlerini inceler ve doğrudan iletişime geçer.</p>

        <h2>İşletmeler İçin</h2>
        <p>Güzellik ve bakım işletmeleri, GüzellikAdresi'ne ücretsiz kaydolarak bölgelerindeki müşterilere ulaşır. İşletmeler hizmetlerini, fotoğraflarını ve iletişim bilgilerini ekleyerek profillerini oluşturur; müşteriler de bu bilgilerle doğru adresi kolayca bulur.</p>

        <h2>Vizyonumuz</h2>
        <p>Türkiye'nin güzellik ve bakım alanında en kapsamlı, en güvenilir ve en hızlı rehberi olmak. Hem hizmet arayanların hem de işletmelerin işini kolaylaştıran bir köprü kurmak.</p>
      </div>
      <Footer />
    </>
  );
}
