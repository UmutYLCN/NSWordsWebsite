import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-12">
          <Link to="/" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Geri Dön</span>
          </Link>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-primary dark:text-white mb-8">Hakkımızda</h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Proje Hakkında</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                NorthStar B1 Words, İngilizce öğrenenler için özel olarak tasarlanmış bir kelime öğrenme platformudur. 
                Bu platform, NorthStar B1 seviyesindeki kelimeleri interaktif ve eğlenceli bir şekilde öğrenmenizi sağlar.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Özellikler</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>İnteraktif kelime kartları</li>
                <li>Hafıza oyunu ile eğlenceli öğrenme</li>
                <li>Reading & Writing ve Listening & Speaking ünitelerini birleştiren Mix Units</li>
                <li>Kullanıcı dostu arayüz</li>
                <li>Mobil uyumlu tasarım</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Geliştirici</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Bu proje, İngilizce öğrenimini daha etkili ve eğlenceli hale getirmek amacıyla geliştirilmiştir. 
                Modern web teknolojileri kullanılarak oluşturulan bu platform, sürekli olarak geliştirilmekte ve 
                yeni özellikler eklenmektedir.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Teknolojiler</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>React</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Framer Motion</li>
                <li>Heroicons</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
