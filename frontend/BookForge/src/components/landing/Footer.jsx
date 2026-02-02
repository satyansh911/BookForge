import {BookOpen, Twitter, Linkedin, Github} from 'lucide-react'
import LottieSafeWrapper from '../ui/LottieSafeWrapper'

const Footer = () => {
  return (
    <footer className='relative bg-gradient-to-br from-gray-950 via-gray-950 to-violet-950 text-white overflow-hidden'>
        <div className='absolute inset-0 opacity-5'>
            <div className='absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full blur-3xl'></div>
        </div>
        <div className='relative max-w-7xl mx-auto px-6 lg:px-8'>
            <div className='py-16 grid grid-cols-1 md:grid-cols-12 gap-12'>
                <div className='md:col-span-5 space-y-6'>
                    <a href="/" className='flex items-center spaxe-x-2.5 group'>
                        <LottieSafeWrapper src="/logo.json" size={50} />
                        <span className='text-xl font-semibold tracking-tight'>BookForge</span>
                    </a>
                    <p className='text-gray-400 leading-relaxed max-w-sm'>
                        Create, design, and publish stunning ebooks with ease.
                    </p>
                    <div className='flex items-center space-x-3 pt-2'>
                        <a
                            href="https://x.com/satyansh009"
                            className='w-10 h-10 bg-white hover:bg-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110'
                            aria-label='Twitter'
                        >
                            <LottieSafeWrapper src="/x.json" size={30} />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/satyansh-singh-b27058292/"
                            className='w-10 h-10 bg-white hover:bg-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110'
                            aria-label='LinkedIn'
                        >
                            <LottieSafeWrapper src="/linkedin.json" size={30} />
                        </a>
                        <a
                            href="https://github.com/satyansh911"
                            className='w-10 h-10 bg-white hover:bg-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110'
                            aria-label='GitHub'
                        >
                            <LottieSafeWrapper src="/github.json" size={30} />
                        </a>
                    </div>
                </div>
                <div className='md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8'>
                    <div>
                        <h3 className='text-sm font-semibold text-white mb-4'>Product</h3>
                        <ul className='space-y-3'>
                            <li>
                                <a href="#features" className='text-gray-400 hover:text-violet-400 transition-colors duration-200 text-sm'>Features</a>
                            </li>
                            <li>
                                <a href="#pricing" className='text-gray-400 hover:text-violet-400 transition-colors duration-200 text-sm'>Pricing</a>
                            </li>
                            <li>
                                <a href="#templates" className=''>Templates</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-sm font-semibold text-white mb-4'>Company</h3>
                        <ul className='space-y-3'>
                            <li>
                                <a href="#about" className='text-gray-400 hover:text-violet-400 transition-colors duration-200 text-sm'>About</a>
                            </li>
                            <li>
                                <a href="#contact" className='text-gray-400 hover:text-violet-400 transition-colors duration-200 text-sm'>Contact</a>
                            </li>
                            <li>
                                <a href="#blog" className='text-gray-400 hover:text-violet-400 transition-colors duration-200 text-sm'>Blog</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-sm font-semibold text-white mb-4'>Legal</h3>
                        <ul className='space-y-3'>
                            <li>
                                <a href="#privacy" className='text-gray-400 hover:text-violet-400 transition-colors duration-200 text-sm'>Privacy</a>
                            </li>
                            <li>
                                <a href="#terms" className='text-gray-400 hover:text-violet-400 transition-colors duration-200 text-sm'>Terms</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className='border-t border-white/10 py-8'>
                <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
                    <p className='text-gray-400 text-sm'>
                        © {new Date().getFullYear()} BookForge. All rights reserved.
                    </p>
                    <p className='text-gray-500 text-sm'>
                        Made with<LottieSafeWrapper src="/heart.json" size={30} /> 
                    </p>
                </div>
            </div>
        </div>
    </footer>
  )
}

export default Footer