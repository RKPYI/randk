import { useEffect, useState } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './App.css'
import CultivationGame from './game/CultivationGame'
import LoadingScreen from './LoadingScreen'

const projects = [
  {
    title: 'Rantale',
    type: 'Novel reading platform',
    description: 'A modern platform for discovering, filtering, and reading serialized stories, with reading progress and author workflows.',
    image: '/rantale.png',
    href: 'https://rantale.ranggadk.com',
  },
  {
    title: 'Cultivation Incremental',
    type: 'Roblox incremental game',
    description: 'A Roblox incremental game where players cultivate Qi, fight mobs, collect spiritual stones, and break through realms toward immortality.',
    image: '/cultivate.png',
    href: 'https://www.roblox.com/games/128506264671282/Cultivation-Incremental',
  },
  {
    title: 'Idle Pokemon Catcher',
    type: 'Browser idle game',
    description: 'A browser idle game where players automatically catch Pokemon, grow their Pokedex, earn coins, and unlock new generations.',
    image: 'https://opengraph.githubassets.com/1/RKPYI/pokemon',
    href: 'https://rkpyi.github.io/pokemon/',
  },
]

const certificates = [
  {
    title: 'Hack Club Stardance Challenge',
    detail: 'Certificate of Achievement · 3 projects · 76 hours',
    image: '/stardance-certificate.jpg',
    href: '/stardance-certificate.pdf',
  },
  {
    title: 'Web Technologies',
    detail: 'LKS Pendidikan Menengah Tingkat Provinsi Jawa Timur · 25 April 2025',
    image: '/web-technologies-certificate.jpg',
    href: '/web-technologies-certificate.pdf',
  },
  {
    title: 'Jagoan Hosting Infra Competition',
    detail: 'Top 30 Nasional · 8 November 2025',
    image: '/infra-competition-certificate.jpg',
    href: '/infra-competition-certificate.pdf',
  },
]

const technologyMarquee = [
  { name: 'PHP', icon: 'php/php-original.svg' },
  { name: 'JavaScript', icon: 'javascript/javascript-original.svg' },
  { name: 'TypeScript', icon: 'typescript/typescript-original.svg' },
  { name: 'React', icon: 'react/react-original.svg' },
  { name: 'Next.js', icon: 'nextjs/nextjs-original.svg' },
  { name: 'Tailwind CSS', icon: 'tailwindcss/tailwindcss-original.svg' },
  { name: 'Lua', icon: 'lua/lua-original.svg' },
  { name: 'HTML5', icon: 'html5/html5-original.svg' },
  { name: 'CSS3', icon: 'css3/css3-original.svg' },
  { name: 'Laravel', icon: 'laravel/laravel-original.svg' },
  { name: 'Linux', icon: 'linux/linux-original.svg' },
  { name: 'Apache', icon: 'apache/apache-original.svg' },
  { name: 'Nginx', icon: 'nginx/nginx-original.svg' },
  { name: 'Vercel', icon: 'vercel/vercel-original.svg' },
  { name: 'Laragon', icon: 'https://cdn.simpleicons.org/laragon' },
  { name: 'VS Code', icon: 'vscode/vscode-original.svg' },
  { name: 'MySQL', icon: 'mysql/mysql-original.svg' },
  { name: 'MariaDB', icon: 'mariadb/mariadb-original.svg' },
  { name: 'PostgreSQL', icon: 'postgresql/postgresql-original.svg' },
  { name: 'SQLite', icon: 'sqlite/sqlite-original.svg' },
]

function App() {
  const [nightMode, setNightMode] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('loading-lock', isLoading)
    return () => document.documentElement.classList.remove('loading-lock')
  }, [isLoading])

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      offset: 90,
      once: false,
      mirror: true,
      disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    })
  }, [])

  return (
    <>
      <LoadingScreen done={!isLoading} onFinish={() => setIsLoading(false)} />
      <main className={`site${nightMode ? ' night' : ''}${isLoading ? ' is-loading' : ''}`} id="top">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="wordmark" href="#top" aria-label="RanDK home">RANDK<span>.</span></a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#journey">Journey</a>
          <a href="#contact">Contact</a>
        </div>
        <button className="mode-toggle" type="button" onClick={() => setNightMode(!nightMode)} aria-label="Toggle color theme" aria-pressed={nightMode}>
          <span className="mode-dot" aria-hidden="true" />
          {nightMode ? 'day mode' : 'night mode'}
        </button>
      </nav>

      <section className="hero shell" id="main-content">
        <div className="hero-copy reveal">
          <p className="kicker">Web Developer</p>
          <h1>Rangga<br />Danu<br />Kusuma</h1>
          <p className="hero-intro">An undergraduate software engineer at UNESA focused on web experiences and backend systems, currently learning game development.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">See the work <span aria-hidden="true">↘</span></a>
            <a className="text-link" href="https://www.linkedin.com/in/rangga-danu-kusuma-62b34a310/" target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
            <a className="text-link" href="https://github.com/RKPYI" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="hero-visual reveal delay-one">
          <CultivationGame />
        </div>
      </section>

      <section className="statement shell" id="about" data-aos="fade-up">
        <p className="section-index">01 / About</p>
        <div className="statement-content">
          <h2>Make it work.<br /><em>Make it feel good.</em></h2>
          <p>I am a university student at Universitas Negeri Surabaya, moving between web development, game development, and the small details that make an interface feel alive.</p>
        </div>
        <div className="skill-list" aria-label="Areas of practice">
          <span>Web development</span>
          <span>Game development</span>
          <span>UI design</span>
          <span>Backend development</span>
        </div>
      </section>

      <section className="tech-section" aria-labelledby="technical-skills-title" data-aos="fade-up">
        <div className="shell">
          <div className="tech-header">
            <p className="section-index">Technical skills</p>
            <h2 id="technical-skills-title">Tools I use<br /><em>to make things.</em></h2>
          </div>
        </div>
        <div className="tech-marquee" aria-label="Technologies and languages">
          <div className="tech-track">
            {[...technologyMarquee, ...technologyMarquee].map((technology, index) => (
              <div className="tech-item" key={`${technology.name}-${index}`} aria-hidden={index >= technologyMarquee.length}>
                <img src={technology.icon.startsWith('http') ? technology.icon : `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${technology.icon}`} alt="" />
                <span>{technology.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="journey shell" id="journey">
        <p className="section-index">02 / Journey</p>
        <div className="journey-grid">
          <div className="journey-column" data-aos="fade-up">
            <h2>Work<br /><em>experience.</em></h2>
            <div className="journey-entry">
              <p className="journey-date">Jan 2025 - Jul 2025</p>
              <h3>Intern Backend Developer</h3>
              <p className="journey-place">PT. Universal Big Data · Malang, Indonesia</p>
              <ul>
                <li>Designed and implemented modular REST APIs to improve maintainability.</li>
                <li>Fixed bugs and isolated issues in legacy API services to improve stability.</li>
                <li>Reduced API response time by 75%, from 2 seconds to 500 ms, through query optimization.</li>
              </ul>
            </div>
            <div className="journey-entry">
              <p className="journey-date">Jan 2024 - Dec 2025</p>
              <h3>Lab Assistant</h3>
              <p className="journey-place">Lab Rekayasa Perangkat Lunak Sekolah · Mojokerto, Indonesia</p>
              <ul>
                <li>Supported practical sessions by preparing presentation equipment and daily materials.</li>
                <li>Installed software such as VS Code and Android Studio on lab computers.</li>
                <li>Guided classmates and younger students through practical work.</li>
                <li>Encouraged classmates to find and join external competitions.</li>
              </ul>
            </div>
          </div>
          <div className="journey-column" data-aos="fade-up" data-aos-delay="100">
            <h2>Study<br /><em>so far.</em></h2>
            <div className="journey-entry">
              <p className="journey-date">2026 - Now</p>
              <h3>Universitas Negeri Surabaya</h3>
              <p>Undergraduate software engineering student at UNESA.</p>
            </div>
            <div className="journey-entry">
              <p className="journey-date">2023 - 2026</p>
              <h3>SMKN 1 Dlanggu</h3>
              <p>Completed secondary vocational education before continuing into undergraduate study.</p>
            </div>
          </div>
          <div className="journey-column" data-aos="fade-up" data-aos-delay="200">
            <h2>Certificates<br /><em>& credentials.</em></h2>
            <div className="certificate-list">
              {certificates.map((certificate) => (
                <a className="certificate-entry" href={certificate.href} target="_blank" rel="noreferrer" key={certificate.title}>
                  <div className="certificate-preview">
                    <img src={certificate.image} alt={`${certificate.title} certificate preview`} loading="lazy" />
                  </div>
                  <div className="certificate-copy">
                    <h3>{certificate.title}</h3>
                    <p>{certificate.detail}</p>
                    <span>Open certificate <span aria-hidden="true">↗</span></span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="work shell" id="work">
        <div className="section-heading" data-aos="fade-up">
          <p className="section-index">03 / Selected work</p>
          <h2>Things I have<br /><em>been making.</em></h2>
        </div>
        <div className="project-list">
          {projects.map((project, index) => (
            <a className={`project project-${index + 1}`} href={project.href} target="_blank" rel="noreferrer" key={project.title} data-aos="fade-up" data-aos-delay={index * 100}>
              <div className="project-image"><img src={project.image} alt={`${project.title} project preview`} loading="lazy" /></div>
              <div className="project-meta">
                <p>{project.type}</p>
                <h3>{project.title}</h3>
                <span>{project.description}</span>
                <strong aria-hidden="true">↗</strong>
              </div>
            </a>
          ))}
        </div>
        <a className="all-work" href="https://github.com/RKPYI?tab=repositories" target="_blank" rel="noreferrer">Browse all repositories <span aria-hidden="true">↗</span></a>
      </section>

      <section className="contact shell" id="contact" data-aos="fade-up">
        <p className="section-index">04 / Say hello</p>
        <div className="contact-line">
          <h2>Have a good<br /><em>idea?</em></h2>
          <a className="contact-email" href="mailto:romagading@gmail.com">romagading<br />@gmail.com <span aria-hidden="true">↗</span></a>
        </div>
        <div className="contact-footer"><span>Rangga Danu Kusuma</span><span>Latest update: October 5, 2026</span><a href="https://github.com/RKPYI" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </section>
      </main>
    </>
  )
}

export default App