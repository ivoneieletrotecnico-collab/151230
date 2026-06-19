import React, { useState } from "react";
import { 
  Zap, 
  Shield, 
  HardHat, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  Menu, 
  X, 
  Send, 
  Building2, 
  Flame, 
  Check, 
  ArrowRight,
  Sparkles,
  Info,
  Clock3
} from "lucide-react";

export default function App() {
  // Navigation active state for mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Contact form submission state
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    servico: "Projetos Elétricos",
    mensagem: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call or message preparation
    setFormSubmitted(true);
  };

  // WhatsApp click handler
  const handleWhatsAppRedirect = (customMessage?: string) => {
    const defaultText = customMessage || "Olá, Ivonei Ferreira! Gostaria de fazer um orçamento de serviços elétricos.";
    const url = `https://wa.me/5574988259925?text=${encodeURIComponent(defaultText)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 selection:bg-[#FF8C00] selection:text-white" id="inicio">
      
      {/* 1. HEADER (Cabeçalho) */}
      <header className="sticky top-0 z-40 bg-[#003366] text-white border-b-4 border-[#FF8C00] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollToSection("inicio")}>
              <div className="bg-[#FF8C00] p-2.5 rounded-sm flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                <Zap className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div>
                <span className="font-display font-black text-lg sm:text-xl tracking-tight leading-tight uppercase block">
                  Ivonei Ferreira
                </span>
                <span className="text-[#FF8C00] font-mono text-xs tracking-widest font-semibold block -mt-1 uppercase">
                  Eletrotécnico
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8 text-xs font-semibold uppercase tracking-wider">
              <button 
                onClick={() => scrollToSection("inicio")} 
                className="hover:text-[#FF8C00] transition-colors py-2 cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#FF8C00] after:transition-all"
              >
                Início
              </button>
              <button 
                onClick={() => scrollToSection("sobre")} 
                className="hover:text-[#FF8C00] transition-colors py-2 cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#FF8C00] after:transition-all"
              >
                Sobre Nós
              </button>
              <button 
                onClick={() => scrollToSection("servicos")} 
                className="hover:text-[#FF8C00] transition-colors py-2 cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#FF8C00] after:transition-all"
              >
                Serviços
              </button>
              <button 
                onClick={() => scrollToSection("diferenciais")} 
                className="hover:text-[#FF8C00] transition-colors py-2 cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#FF8C00] after:transition-all"
              >
                Diferenciais
              </button>
              <button 
                onClick={() => scrollToSection("contato")} 
                className="hover:text-[#FF8C00] transition-colors py-2 cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#FF8C00] after:transition-all"
              >
                Contato
              </button>
            </nav>

            {/* Desktop Action Button */}
            <div className="hidden lg:block">
              <button 
                onClick={() => scrollToSection("contato")}
                className="bg-[#FF8C00] text-white px-5 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-[#e07b00] transition-all duration-300"
              >
                Solicitar Orçamento
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-sm hover:bg-slate-800 transition-colors"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#002244] border-t border-slate-800 py-4 px-6 space-y-3 shadow-inner">
            <button 
              onClick={() => scrollToSection("inicio")} 
              className="block w-full text-left py-2 hover:text-[#FF8C00] transition-colors text-xs font-semibold uppercase tracking-wider"
            >
              Início
            </button>
            <button 
              onClick={() => scrollToSection("sobre")} 
              className="block w-full text-left py-2 hover:text-[#FF8C00] transition-colors text-xs font-semibold uppercase tracking-wider"
            >
              Sobre Nós
            </button>
            <button 
              onClick={() => scrollToSection("servicos")} 
              className="block w-full text-left py-2 hover:text-[#FF8C00] transition-colors text-xs font-semibold uppercase tracking-wider"
            >
              Serviços
            </button>
            <button 
              onClick={() => scrollToSection("diferenciais")} 
              className="block w-full text-left py-2 hover:text-[#FF8C00] transition-colors text-xs font-semibold uppercase tracking-wider"
            >
              Diferenciais
            </button>
            <button 
              onClick={() => scrollToSection("contato")} 
              className="block w-full text-left py-2 hover:text-[#FF8C00] transition-colors text-xs font-semibold uppercase tracking-wider"
            >
              Contato
            </button>
            <div className="pt-2">
              <button 
                onClick={() => {
                  scrollToSection("contato");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#FF8C00] text-white hover:bg-[#e07b00] text-center block py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest shadow-lg"
              >
                Solicitar Orçamento
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center bg-[#001f3f] text-white overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1024&q=80" 
            alt="Electrical engineering panel" 
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#002244]/95 via-[#001f3f]/90 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-8 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-[#FF8C00]/20 border border-[#FF8C00]/30 px-3 py-1.5 rounded-sm text-[#FF8C00] text-xs uppercase tracking-wider font-mono font-bold animate-pulse">
                <Shield className="h-4 w-4" />
                <span>Normas NBR 5410 & NR-10 Respeitadas</span>
              </div>
              
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-tight uppercase">
                Segurança e Serviços Técnicos de Ponta para o seu <span className="text-[#FF8C00]">Projeto Elétrico</span>
              </h1>
              
              <p className="text-blue-100 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed font-light">
                Soluções integradas com rigor técnico para residências, condomínios, construtoras e indústrias na região de <strong className="text-white font-medium">Irecê e arredores</strong>. Projetos elétricos com garantia extrema e conformidade integral com as normas regulamentadoras.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                {/* Secondary Button - WhatsApp CTA */}
                <button 
                  onClick={() => handleWhatsAppRedirect()}
                  className="bg-[#FF8C00] hover:bg-[#e07b00] text-white px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg shadow-[#FF8C00]/20 flex items-center justify-center space-x-3 cursor-pointer group italic"
                >
                  <Phone className="h-5 w-5 text-white" />
                  <span>Falar no WhatsApp: (74) 98825-9925</span>
                  <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                </button>

                <button 
                  onClick={() => scrollToSection("servicos")}
                  className="bg-transparent border-2 border-slate-500 hover:border-white text-slate-300 hover:text-white px-8 py-4 rounded-sm font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  Conhecer Serviços
                </button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-[#FF8C00]" />
                  <span className="text-slate-350 text-xs font-mono uppercase tracking-wider">Garantia Total</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-[#FF8C00]" />
                  <span className="text-slate-350 text-xs font-mono uppercase tracking-wider">Escopo Credenciado</span>
                </div>
                <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
                  <CheckCircle2 className="h-5 w-5 text-[#FF8C00]" />
                  <span className="text-slate-350 text-xs font-mono uppercase tracking-wider">Irecê e Região</span>
                </div>
              </div>
            </div>

            {/* Side visual card */}
            <div className="lg:col-span-4 hidden lg:block bg-slate-900/90 backdrop-blur-md p-8 rounded-sm border-l-4 border-[#FF8C00] border-t border-r border-b border-slate-800 shadow-2xl space-y-6">
              <h3 className="font-display font-black text-lg text-white border-b border-slate-850 pb-4 uppercase tracking-tight">
                Atendimento Técnico Rápido
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 bg-[#003366] p-1.5 rounded-sm">
                    <MapPin className="h-4 w-4 text-[#FF8C00]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest">Região de Atuação</p>
                    <p className="text-sm font-medium text-slate-350">Irecê, BA e arredores imediatos</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-1 bg-[#003366] p-1.5 rounded-sm">
                    <Clock3 className="h-4 w-4 text-[#FF8C00]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest">Horário de Resposta</p>
                    <p className="text-sm font-medium text-slate-350">Retorno garantido em até 2 horas</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-1 bg-[#003366] p-1.5 rounded-sm">
                    <Shield className="h-4 w-4 text-[#FF8C00]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest">Segurança Ativa</p>
                    <p className="text-sm font-medium text-slate-350">NR-10 e NBR 5410 em 100% das obras</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FF8C00]/10 border border-[#FF8C00]/25 p-4 rounded-sm text-xs space-y-2">
                <p className="font-black text-[#FF8C00] uppercase tracking-wider">Laudos e Pareceres Rápidos</p>
                <p className="text-slate-400 leading-normal">
                  Precisa de ART/CRT urgente para aprovação técnica junto à concessionária de energia? Nós cuidamos de tudo.
                </p>
              </div>

              <button 
                onClick={() => handleWhatsAppRedirect("Olá! Gostaria de esclarecer uma dúvida técnica sobre projetos elétricos.")}
                className="w-full bg-[#003366] hover:bg-[#002244] border border-[#FF8C00]/30 text-white font-bold py-3 rounded-sm tracking-wider text-xs uppercase text-center transition-colors block cursor-pointer"
              >
                Tire suas Dúvidas Online
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SOBRE NÓS */}
      <section className="py-20 sm:py-28 bg-white text-slate-900 scroll-mt-10" id="sobre">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Column / Placeholders */}
            <div className="lg:col-span-5 relative">
              <div className="absolute top-0 left-0 w-24 h-24 bg-[#FF8C00]/10 rounded-sm -z-10"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#003366]/5 rounded-sm -z-10"></div>
              
              <div className="bg-[#003366] text-white p-8 rounded-sm shadow-xl border-l-4 border-[#FF8C00] relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10">
                  <Zap className="h-64 w-64" />
                </div>
                
                <h4 className="font-display font-black uppercase text-xl mb-4 border-b border-slate-700 pb-3 tracking-wider">
                  Compromisso Técnico
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed font-light mb-6">
                  Atuamos sob a chancela das principais regulamentações elétricas do país. Cada detalhe da fiação, disjuntores e projeto elétrico é exaustivamente calibrado para evitar sobrecarga e riscos de incêndio.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 bg-slate-900/40 p-3 rounded-sm border-l-2 border-[#FF8C00] border-t border-r border-b border-slate-800">
                    <Shield className="h-5 w-5 text-[#FF8C00] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">NBR 5410</p>
                      <p className="text-xs text-slate-400 font-mono uppercase">Instalações Baixa Tensão</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-900/40 p-3 rounded-sm border-l-2 border-[#FF8C00] border-t border-r border-b border-slate-800">
                    <HardHat className="h-5 w-5 text-[#FF8C00] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">Norma NR-10</p>
                      <p className="text-xs text-slate-400 font-mono uppercase">Segurança e Serviços</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Small floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-sm shadow-lg border-l-4 border-[#003366] border-t border-r border-b border-slate-100 flex items-center space-x-3 hidden sm:flex">
                <div className="bg-[#FF8C00]/10 p-2.5 rounded-sm text-[#FF8C00]">
                  <Check className="h-5 w-5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest font-black">CRT Emitido</p>
                  <p className="text-xs font-bold text-slate-800">Garantia Técnica Total</p>
                </div>
              </div>
            </div>

            {/* Text Copy Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[#FF8C00] font-mono text-xs tracking-widest font-black uppercase block">
                Sobre Ivonei Ferreira
              </span>
              
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#003366] tracking-tight uppercase leading-tight">
                Autoridade, Rigor Técnico e Resolução Rápida de Problemas Elétricos
              </h2>
              
              <p className="text-slate-650 leading-relaxed font-light text-base sm:text-lg">
                Seja para uma residência que necessita de readequação de carga segura, um condomínio que precisa de sistemas de emergência de alta confiabilidade ou uma indústria demandando montagem complexa de painéis de comando — o trabalho de um eletrotécnico faz a diferença entre a segurança operacional e riscos fatais.
              </p>

              <p className="text-slate-650 leading-relaxed font-light text-base sm:text-lg">
                <strong className="text-slate-900 font-semibold">Ivonei Ferreira</strong> é especialista em prover soluções que unem cumprimento exato de prazos, uso de materiais no padrão de qualidade adequado e atendimento cirúrgico na região de Irecê. Nosso foco é oferecer um processo transparente, com laudos técnicos precisos, emitindo as devidas documentações e guias de responsabilidade exigidas pelas prefeituras e concessionárias.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <ul className="space-y-2 text-slate-700 font-light text-sm">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-none"></span>
                    <span>Projetos 100% autorais e validados</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-none"></span>
                    <span>Experiência local avançada (Irecê e região)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-none"></span>
                    <span>Atendimento focado em prevenção de riscos</span>
                  </li>
                </ul>

                <ul className="space-y-2 text-slate-700 font-light text-sm">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-none"></span>
                    <span>Montagem técnica avançada de painéis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-none"></span>
                    <span>Emissão de Termo de Responsabilidade</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-none"></span>
                    <span>Compromisso absoluto com o cronograma</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => scrollToSection("contato")}
                  className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-3.5 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors inline-flex items-center space-x-2 cursor-pointer shadow-md"
                >
                  <span>Agendar uma Visita Técnica</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. ÁREAS DE ATUAÇÃO (SERVIÇOS) */}
      <section className="py-20 sm:py-28 bg-slate-100 text-[#003366] scroll-mt-10" id="servicos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[#FF8C00] font-mono text-xs tracking-widest font-black uppercase block">
              Nossas Especialidades
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-[#003366] tracking-tight uppercase leading-tight">
              Áreas de Atuação Técnica
            </h2>
            <p className="text-slate-650 text-base sm:text-lg font-light leading-relaxed">
              Diferentes necessidades demandam conhecimentos técnicos rigorosos. Oferecemos quatro pilares de serviços voltados ao alto desempenho e à estabilidade da sua rede de energia.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card 1: Instalações Residenciais */}
            <div className="bg-white rounded-sm p-8 shadow-sm border-l-4 border-[#003366] border-t border-r border-b border-slate-200/85 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between relative">
              <div className="space-y-4">
                <div className="bg-[#003366]/5 text-[#003366] group-hover:bg-[#FF8C00] group-hover:text-white p-3.5 rounded-sm w-14 h-14 flex items-center justify-center transition-colors duration-300">
                  <Zap className="h-7 w-7" />
                </div>
                
                <h3 className="font-display font-black uppercase text-xl text-[#003366] group-hover:text-[#FF8C00] transition-colors leading-snug">
                  Instalações Residenciais
                </h3>
                <span className="inline-block text-[#FF8C00] font-black font-mono text-[10px] uppercase tracking-wider">
                  BAIXA TENSÃO / RESIDENCIAL / PREDIAL
                </span>
                
                <p className="text-slate-600 text-sm leading-relaxed font-light">
                  Soluções completas abrangendo estruturação completa da fiação, cálculo e adequação de carga elétrica ideal, montagem e organização de quadros de distribuição, e adaptação ao padrão de entrada correto exigido pela concessionária. Seguimos à risca cada norma estabelecida pela <strong className="font-semibold text-slate-805">ABNT NBR 5410</strong> para fiação segura de baixa tensão.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center text-[10px] font-mono font-black tracking-widest uppercase text-slate-500">
                <span>PADRÃO: ABNT NBR 5410</span>
                <button 
                  onClick={() => handleWhatsAppRedirect("Olá Ivonei, gostaria de solicitar um orçamento para Instalações Elétricas Residenciais.")}
                  className="text-[#003366] hover:text-[#FF8C00] hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <span>Orçar via WhatsApp</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Card 2: Sistemas de Emergência e Predial */}
            <div className="bg-white rounded-sm p-8 shadow-sm border-l-4 border-[#003366] border-t border-r border-b border-slate-200/85 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between relative">
              <div className="space-y-4">
                <div className="bg-[#003366]/5 text-[#003366] group-hover:bg-[#FF8C00] group-hover:text-white p-3.5 rounded-sm w-14 h-14 flex items-center justify-center transition-colors duration-300">
                  <Flame className="h-7 w-7" />
                </div>
                
                <h3 className="font-display font-black uppercase text-xl text-[#003366] group-hover:text-[#FF8C00] transition-colors leading-snug">
                  Sistemas de Emergência e Predial
                </h3>
                <span className="inline-block text-[#FF8C00] font-black font-mono text-[10px] uppercase tracking-wider">
                  PROTEÇÃO ATIVA / SEGURANÇA PATRIMONIAL
                </span>
                
                <p className="text-slate-600 text-sm leading-relaxed font-light">
                  Proteção patrimonial profunda. Executamos infraestrutura predial inteligente, rotas redundantes de energia ininterrupta para geradores e no-breaks comerciais, proteção estrutural ativa contra curtos e falhas de aterramento de grandes dimensões, além de instalações específicas voltadas à sinalização, extintores elétricos e rotas de emergência para proteção ativa contra incêndios.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center text-[10px] font-mono font-black tracking-widest uppercase text-slate-500">
                <span>FIDELIDADE OPERACIONAL</span>
                <button 
                  onClick={() => handleWhatsAppRedirect("Olá Ivonei, gostaria de solicitar um orçamento para Sistemas de Emergência e Redes Prediais.")}
                  className="text-[#003366] hover:text-[#FF8C00] hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <span>Orçar via WhatsApp</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Card 3: Instalações Industriais */}
            <div className="bg-white rounded-sm p-8 shadow-sm border-l-4 border-[#003366] border-t border-r border-b border-slate-200/85 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between relative">
              <div className="space-y-4">
                <div className="bg-[#003366]/5 text-[#003366] group-hover:bg-[#FF8C00] group-hover:text-white p-3.5 rounded-sm w-14 h-14 flex items-center justify-center transition-colors duration-300">
                  <Building2 className="h-7 w-7" />
                </div>
                
                <h3 className="font-display font-black uppercase text-xl text-[#003366] group-hover:text-[#FF8C00] transition-colors leading-snug">
                  Instalações Industriais
                </h3>
                <span className="inline-block text-[#FF8C00] font-black font-mono text-[10px] uppercase tracking-wider">
                  AUTOMAÇÃO / MOTORES / PAINÉIS DE FORÇA
                </span>
                
                <p className="text-slate-600 text-sm leading-relaxed font-light">
                  Foco na produtividade e redução de paradas não programadas. Especialidade em engenharia reversa e montagem de painéis de distribuição e comando de maquinário, instalação de infraestrutura pesada de alta e baixa tensão, dimensionamento térmico e ligação profissional de motores trifásicos, além de automação industrial de base e CLP.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center text-[10px] font-mono font-black tracking-widest uppercase text-slate-500">
                <span>PADRÃO DE POTÊNCIA</span>
                <button 
                  onClick={() => handleWhatsAppRedirect("Olá Ivonei, gostaria de solicitar um orçamento para Montagem e Instalações Elétricas Industriais.")}
                  className="text-[#003366] hover:text-[#FF8C00] hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <span>Orçar via WhatsApp</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Card 4: Projetos Elétricos */}
            <div className="bg-white rounded-sm p-8 shadow-sm border-l-4 border-[#003366] border-t border-r border-b border-slate-200/85 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between relative">
              <div className="space-y-4">
                <div className="bg-[#003366]/5 text-[#003366] group-hover:bg-[#FF8C00] group-hover:text-white p-3.5 rounded-sm w-14 h-14 flex items-center justify-center transition-colors duration-300">
                  <FileText className="h-7 w-7" />
                </div>
                
                <h3 className="font-display font-black uppercase text-xl text-[#003366] group-hover:text-[#FF8C00] transition-colors leading-snug">
                  Projetos Elétricos e Laudos
                </h3>
                <span className="inline-block text-[#FF8C00] font-black font-mono text-[10px] uppercase tracking-wider">
                  CERTIFICAÇÃO CRT / ART / SEGURANÇA
                </span>
                
                <p className="text-slate-600 text-sm leading-relaxed font-light">
                  Da ideia conceitual à validação oficial. Oferecemos planejamento meticuloso em software técnico, desenho esquemático e unifilar detalhado, emissão de laudo de conformidade, perícias elétricas de queima de equipamentos, renovação de cadastro, e emissão formal de CRT/ART para regularização de obras perante os órgãos de fiscalização pública e Coelba.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center text-[10px] font-mono font-black tracking-widest uppercase text-slate-500">
                <span>NR10 RESPEITADA</span>
                <button 
                  onClick={() => handleWhatsAppRedirect("Olá Ivonei, gostaria de conversar sobre Projetos Elétricos, Laudos ou emissão de CRT/ART.")}
                  className="text-[#003366] hover:text-[#FF8C00] hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <span>Orçar via WhatsApp</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

          </div>

          <div className="mt-16 bg-[#003366] text-white rounded-sm p-8 sm:p-12 shadow-sm border-l-4 border-[#FF8C00] border-t border-r border-b border-blue-900 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 font-mono text-9xl pointer-events-none select-none">
              ⚡
            </div>
            
            <div className="space-y-4 max-w-2xl relative z-10">
              <h3 className="font-display font-black uppercase text-2xl sm:text-3xl leading-tight">
                Seu projeto elétrico precisa de um Laudo de Conformidade Técnica?
              </h3>
              <p className="text-blue-100 text-sm sm:text-base font-light">
                Evite multas e atrasos na sua obra. Ivonei Ferreira executa de forma ágil o levantamento físico e a entrega de sua documentação no padrão formal.
              </p>
            </div>
            <button 
              onClick={() => handleWhatsAppRedirect("Olá Ivonei, preciso de um Laudo e Certificado Técnico (CRT/ART) urgente para o meu projeto elétrico.")}
              className="bg-[#FF8C00] hover:bg-[#e07b00] text-white px-8 py-4 rounded-sm font-bold tracking-wider text-xs uppercase transition-all text-center block w-full md:w-auto cursor-pointer shadow-lg"
            >
              Consultar Urgência
            </button>
          </div>

        </div>
      </section>

      {/* 5. DIFERENCIAIS */}
      <section className="py-20 sm:py-28 bg-white text-slate-900 scroll-mt-10" id="diferenciais">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Header */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-[#FF8C00] font-mono text-xs tracking-widest font-black uppercase block">
                Por que escolher a nossa empresa?
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#003366] tracking-tight leading-tight uppercase">
                Os Diferenciais da Marca Ivonei Ferreira
              </h2>
              <p className="text-slate-650 font-light text-base leading-relaxed">
                Tornamos as etapas elétricas a parte mais simples e segura do seu planejamento de obra ou expansão predial. Atendimento com velocidade em toda a região de Irecê.
              </p>
              
              <div className="pt-4">
                <button 
                  onClick={() => scrollToSection("contato")}
                  className="bg-slate-105 hover:bg-slate-200 text-[#003366] font-bold px-5 py-3.5 rounded-sm text-xs uppercase tracking-widest flex items-center space-x-2 transition-colors cursor-pointer border border-slate-200 shadow-sm"
                >
                  <span>Solicitar Atendimento</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Pillars Details */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Pillar 1 */}
              <div className="bg-slate-50 border-l-4 border-[#003366] border-t border-r border-b border-slate-250 p-6 rounded-sm space-y-4 hover:border-[#FF8C00]/30 transition-all shadow-sm">
                <div className="bg-[#FF8C00]/10 p-3 rounded-sm w-12 h-12 flex items-center justify-center text-[#FF8C00]">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#003366]">
                  Atendimento Rápido em Irecê
                </h3>
                <p className="text-slate-650 text-xs sm:text-sm leading-relaxed font-light">
                  Seja para vistorias, laudos de emergência ou reuniões de obra. Atendemos com extrema presteza em Irecê e toda a região circunvizinha, respeitando prazos e urgências.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-slate-50 border-l-4 border-[#003366] border-t border-r border-b border-slate-250 p-6 rounded-sm space-y-4 hover:border-[#FF8C00]/30 transition-all shadow-sm">
                <div className="bg-[#FF8C00]/10 p-3 rounded-sm w-12 h-12 flex items-center justify-center text-[#FF8C00]">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#003366]">
                  Corpo Técnico Qualificado
                </h3>
                <p className="text-slate-650 text-xs sm:text-sm leading-relaxed font-light">
                  Eletrotécnico experiente e devidamente registrado com sólidos anos de atuação, focado na mais pura precisão da engenharia de baixa e média tensão e normas.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-slate-50 border-l-4 border-[#003366] border-t border-r border-b border-slate-250 p-6 rounded-sm space-y-4 hover:border-[#FF8C00]/30 transition-all shadow-sm">
                <div className="bg-[#FF8C00]/10 p-3 rounded-sm w-12 h-12 flex items-center justify-center text-[#FF8C00]">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#003366]">
                  Agilidade e Garantia Total
                </h3>
                <p className="text-slate-650 text-xs sm:text-sm leading-relaxed font-light">
                  Tranquilidade de ponta a ponta. Garantimos o funcionamento correto pós-entrega, fornecendo suporte ágil e imediato aos nossos parceiros comerciais e residenciais.
                </p>
              </div>

            </div>

          </div>

          {/* Testimonial Quote Highlight */}
          <div className="border-t border-slate-100 pt-16 mt-16 max-w-4xl mx-auto">
            <blockquote className="text-center space-y-4">
              <p className="font-display font-light text-lg sm:text-xl text-[#003366] leading-relaxed italic">
                &ldquo;Em eletricidade, desvios pequenos geram acidentes gravíssimos. Nosso compromisso absoluto com as normas técnicas (NBR 5410 e NR-10) garante a proteção da sua vida, dos seus funcionários e do seu patrimônio.&rdquo;
              </p>
              <footer className="font-mono text-[10px] uppercase tracking-widest text-slate-500 font-black">
                — Ivonei Ferreira, Diretor Técnico
              </footer>
            </blockquote>
          </div>

        </div>
      </section>

      {/* 6. CONCESSIONÁRIA & INFRAESTRUTURA COMPATÍVEL BANNER */}
      <section className="bg-slate-900 py-12 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-xs font-mono uppercase tracking-widest text-[#FF8C00] font-bold">Projetos Técnicos Padronizados</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-60 hover:opacity-100 transition-opacity">
            <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-white/90">PADRÃO COELBA</span>
            <span className="h-6 w-px bg-slate-700 hidden sm:block"></span>
            <span className="font-display font-semibold text-lg sm:text-xl tracking-tight text-white/90">ABNT SEGURO</span>
            <span className="h-6 w-px bg-slate-700 hidden sm:block"></span>
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white/90">CREA / CFT REGISTRADO</span>
          </div>
        </div>
      </section>

      {/* 7. FOOTER & CONTATO */}
      <section className="bg-[#001c37] text-white py-20 scroll-mt-10" id="contato">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Quick Contact Form Column */}
            <div className="lg:col-span-7 bg-[#00264d] p-8 sm:p-10 rounded-sm border-l-4 border-[#FF8C00] border-t border-r border-b border-blue-900 shadow-xl flex flex-col justify-between">
              
              <div>
                <span className="text-[#FF8C00] font-mono text-xs tracking-widest font-black uppercase block mb-2">
                  Contato Direto
                </span>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase mb-4 tracking-tight">
                  Solicite um Orçamento Sem Compromisso
                </h3>
                <p className="text-blue-100/70 text-sm font-light leading-relaxed mb-6">
                  Preencha o formulário abaixo descrevendo seu caso técnico, ou clique diretamente no botão para nos enviar uma mensagem imediata via WhatsApp.
                </p>
              </div>

              {formSubmitted ? (
                <div className="bg-[#FF8C00]/10 border-l-4 border-[#FF8C00] border-t border-r border-b border-[#FF8C00]/40 p-6 rounded-sm space-y-4 animate-fadeIn my-auto text-center py-12">
                  <div className="bg-[#FF8C00] p-3 rounded-sm w-12 h-12 flex items-center justify-center mx-auto text-white">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <h4 className="font-display font-black text-xl text-white uppercase tracking-wider">Solicitação Recebida com Sucesso!</h4>
                  <p className="text-sm text-blue-100/90 leading-relaxed max-w-md mx-auto">
                    Excelente, {formData.nome}. Suas informações foram enviadas. Retornaremos em até 2 horas úteis. Deseja agilizar o fluxo de sua resposta e falar imediatamente com o especialista no WhatsApp?
                  </p>
                  <button 
                    onClick={() => handleWhatsAppRedirect(`Olá Ivonei, me chamo ${formData.nome}. Gostaria de agilizar o orçamento de meu formulário de ${formData.servico}.`)}
                    className="mt-4 bg-[#FF8C00] hover:bg-[#e07b00] text-white px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-transform inline-flex items-center space-x-2 cursor-pointer shadow-md"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Chamar Ivonei no WhatsApp</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-blue-100/80 font-black block">Seu Nome *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        placeholder="Nome Sobrenome" 
                        className="w-full bg-[#001c37] border border-blue-900 focus:border-[#FF8C00] px-4 py-3 rounded-sm text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-blue-100/80 font-black block">Seu E-mail *</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="contato@empresa.com" 
                        className="w-full bg-[#001c37] border border-blue-900 focus:border-[#FF8C00] px-4 py-3 rounded-sm text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-blue-100/80 font-black block">Seu Telefone *</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.telefone}
                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                        placeholder="(74) 99999-9999" 
                        className="w-full bg-[#001c37] border border-blue-900 focus:border-[#FF8C00] px-4 py-3 rounded-sm text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-blue-100/80 font-black block">Serviço Desejado</label>
                      <select 
                        value={formData.servico}
                        onChange={(e) => setFormData({...formData, servico: e.target.value})}
                        className="w-full bg-[#001c37] border border-blue-900 focus:border-[#FF8C00] px-4 py-3 rounded-sm text-xs text-white focus:outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="Projetos Elétricos">Projetos Elétricos</option>
                        <option value="Laudos e ART/CRT">Laudos e ART/CRT</option>
                        <option value="Instalações Residenciais">Instalações Residenciais</option>
                        <option value="Instalações Industriais">Instalações Industriais</option>
                        <option value="Sistemas de Emergência">Sistemas de Emergência</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-blue-100/80 font-black block">Mensagem Técnica</label>
                    <textarea 
                      rows={3}
                      value={formData.mensagem}
                      onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                      placeholder="Descreva aqui o seu projeto, sua obra, laudo ou adequação necessária..."
                      className="w-full bg-[#001c37] border border-blue-900 focus:border-[#FF8C00] px-4 py-3 rounded-sm text-sm text-white focus:outline-none transition-colors"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#FF8C00] hover:bg-[#e07b00] text-white py-3.5 rounded-sm font-bold uppercase text-xs tracking-widest flex items-center justify-center space-x-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    <Send className="h-4 w-4" />
                    <span>Enviar Mensagem</span>
                  </button>
                </form>
              )}

            </div>

            {/* Corporate/Contact Details Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              
              <div className="space-y-6">
                <div>
                  <span className="font-display font-black text-2xl uppercase tracking-tight leading-tight block">
                    Ivonei Ferreira
                  </span>
                  <span className="text-[#FF8C00] font-mono text-xs tracking-widest font-black block uppercase -mt-0.5">
                    Eletrotécnico Especialista
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Phone */}
                  <div className="flex items-start space-x-3 cursor-pointer group" onClick={() => handleWhatsAppRedirect()}>
                    <div className="mt-1 bg-[#001c37] p-2 rounded-sm text-[#FF8C00] group-hover:bg-[#FF8C00] group-hover:text-white transition-colors border border-blue-900">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-100/60 uppercase font-mono font-bold tracking-wider">Contato Direto / WhatsApp</p>
                      <p className="text-sm font-semibold text-white group-hover:underline">(74) 98825-9925</p>
                    </div>
                  </div>

                  {/* E-mail */}
                  <div className="flex items-start space-x-3 cursor-pointer group" onClick={() => window.open("mailto:ivonei.energia@gmail.com")}>
                    <div className="mt-1 bg-[#001c37] p-2 rounded-sm text-[#FF8C00] group-hover:bg-[#FF8C00] group-hover:text-white transition-colors border border-blue-900">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-100/60 uppercase font-mono font-bold tracking-wider">E-mail de Contato</p>
                      <p className="text-sm font-semibold text-white group-hover:underline">ivonei.energia@gmail.com</p>
                    </div>
                  </div>

                  {/* Geolocation */}
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 bg-[#001c37] p-2 rounded-sm text-[#FF8C00] border border-blue-900">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-100/60 uppercase font-mono font-bold tracking-wider">Área Sede</p>
                      <p className="text-sm text-white">Irecê, Bahia e Cidades Vizinhas</p>
                    </div>
                  </div>

                  {/* Calendar / Hours */}
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 bg-[#001c37] p-2 rounded-sm text-[#FF8C00] border border-blue-900">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-100/60 uppercase font-mono font-bold tracking-wider">Horário de Atendimento Comercial</p>
                      <p className="text-sm text-white leading-relaxed">
                        Segunda a Sexta: 08:00 às 18:00 <br />
                        Sábados: 08:00 às 12:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Stamp */}
              <div className="bg-[#00264d] p-5 rounded-sm border-l-4 border-[#FF8C00] border-t border-r border-b border-blue-905 text-xs text-blue-100/80 space-y-2 shadow-sm">
                <div className="flex items-center space-x-2 text-[#FF8C00]">
                  <Shield className="h-4 w-4 shrink-0" />
                  <span className="font-black uppercase tracking-wider font-mono text-[10px]">Garantia Segurança Máxima</span>
                </div>
                <p className="leading-relaxed font-light text-blue-100/70">
                  Nossa atuação segue rigorosamente as diretrizes federais vigentes e normas de segurança em instalações e serviços em eletricidade do Ministério do Trabalho e Emprego.
                </p>
              </div>

            </div>

          </div>

          {/* Copyright Row */}
          <div className="border-t border-blue-900/60 mt-16 pt-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-blue-100/50">
            <p>
              &copy; {new Date().getFullYear()} Ivonei Ferreira Eletrotécnico. Todos os direitos reservados.
            </p>
            <p className="font-mono uppercase tracking-wider text-[10px]">
              Instalações & Projetos Elétricos de Alta Segurança
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
