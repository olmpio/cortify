import type { ReactNode } from 'react';
import { EMPRESA, faltaPreencher } from '@/config/empresa';

const H = ({ children }: { children: string }) => <h3 className="text-white font-semibold mt-6 mb-2">{children}</h3>;
const P = ({ children }: { children: ReactNode }) => <p className="text-stone-400 text-sm leading-relaxed mb-3">{children}</p>;
const Li = ({ children }: { children: ReactNode }) => <li className="text-stone-400 text-sm leading-relaxed ml-5 list-disc">{children}</li>;

function Aviso() {
  if (!faltaPreencher) return null;
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
      <p className="text-red-400 text-sm font-semibold">⚠️ Texto-modelo — não publique assim</p>
      <p className="text-red-300/80 text-xs mt-1">
        Preencha os dados em <code>src/config/empresa.ts</code> e peça a um advogado para revisar este texto. Este aviso some
        sozinho quando não restar nenhum campo entre colchetes.
      </p>
    </div>
  );
}

export function TermosConteudo() {
  return (
    <div>
      <Aviso />
      <P>Última atualização: {EMPRESA.atualizadoEm}</P>
      <H>1. Sobre o serviço</H>
      <P>
        O {EMPRESA.produto}, operado por {EMPRESA.razaoSocial} (CNPJ {EMPRESA.cnpj}), é uma plataforma que conecta clientes a
        barbearias para agendamento de serviços e comunicação. A prestação do serviço de barbearia é responsabilidade exclusiva de
        cada estabelecimento.
      </P>
      <H>2. Conta e segurança</H>
      <P>Você deve fornecer informações verdadeiras, manter sua senha em sigilo e é responsável pelas atividades feitas na sua conta. Avise-nos se suspeitar de uso indevido.</P>
      <H>3. Uso adequado</H>
      <ul className="mb-3 space-y-1">
        <Li>Não use a plataforma para fraude, spam, assédio ou conteúdo ilegal.</Li>
        <Li>Não tente acessar dados de outros usuários nem comprometer a segurança do sistema.</Li>
        <Li>Agendamentos devem ser feitos de boa-fé; cancele com antecedência quando não puder comparecer.</Li>
      </ul>
      <H>4. Agendamentos, preços e cancelamentos</H>
      <P>Preços, horários e políticas de cancelamento são definidos por cada barbearia. A plataforma pode ser indisponibilizada temporariamente para manutenção.</P>
      <H>5. Conteúdo enviado</H>
      <P>Fotos e mensagens enviadas são de responsabilidade de quem as envia, que declara ter os direitos necessários. Podemos remover conteúdo que viole estes termos.</P>
      <H>6. Limitação de responsabilidade</H>
      <P>Não nos responsabilizamos pela qualidade do serviço prestado pelas barbearias nem por indisponibilidades fora do nosso controle, na extensão permitida pela lei.</P>
      <H>7. Alterações e encerramento</H>
      <P>Podemos atualizar estes termos; mudanças relevantes serão comunicadas. Você pode excluir sua conta a qualquer momento pela própria plataforma.</P>
      <H>8. Foro</H>
      <P>Fica eleito o foro de {EMPRESA.foro}, ressalvados os direitos do consumidor.</P>
    </div>
  );
}

export function PrivacidadeConteudo() {
  return (
    <div>
      <Aviso />
      <P>Última atualização: {EMPRESA.atualizadoEm}</P>
      <H>1. Quem é o controlador dos seus dados</H>
      <P>
        {EMPRESA.razaoSocial}, CNPJ {EMPRESA.cnpj}, {EMPRESA.endereco}. Contato do encarregado (DPO) para assuntos de privacidade:{' '}
        {EMPRESA.emailPrivacidade}.
      </P>
      <H>2. Quais dados coletamos</H>
      <ul className="mb-3 space-y-1">
        <Li>Cadastro: nome, e-mail, telefone e senha (guardada apenas em formato criptografado/hash).</Li>
        <Li>Uso: agendamentos (serviço, barbeiro, data e horário), mensagens trocadas com barbearias e fotos enviadas.</Li>
        <Li>Técnicos: endereço IP, tipo de navegador e registros de acesso, para segurança e prevenção a fraudes.</Li>
      </ul>
      <H>3. Para que usamos (finalidades e bases legais)</H>
      <ul className="mb-3 space-y-1">
        <Li>Criar e manter sua conta e realizar agendamentos — execução de contrato.</Li>
        <Li>Enviar e-mails transacionais (confirmações, avisos, recuperação de senha) — execução de contrato.</Li>
        <Li>Segurança, prevenção a fraudes e cumprimento de obrigações legais — legítimo interesse e obrigação legal.</Li>
      </ul>
      <P>Não vendemos seus dados nem os usamos para publicidade de terceiros.</P>
      <H>4. Com quem compartilhamos</H>
      <P>
        Com a barbearia escolhida por você (nome, telefone e e-mail do agendamento, e as mensagens da conversa) e com provedores que
        nos ajudam a operar o serviço (hospedagem, banco de dados e envio de e-mail), sob obrigações de confidencialidade.
      </P>
      <H>5. Por quanto tempo guardamos</H>
      <P>Enquanto sua conta existir. Ao excluí-la, removemos seus dados pessoais, conversas e sessões; os agendamentos passados ficam anonimizados para a barbearia, sem identificar você.</P>
      <H>6. Seus direitos (LGPD, art. 18)</H>
      <P>
        Você pode confirmar a existência de tratamento, acessar, corrigir, portar e eliminar seus dados, e revogar consentimentos.
        Na plataforma: <strong>Meus agendamentos → Seus dados</strong> permite corrigir nome/telefone, baixar uma cópia dos seus
        dados e excluir a conta. Também pode escrever para {EMPRESA.emailPrivacidade}.
      </P>
      <H>7. Cookies</H>
      <P>Usamos apenas um cookie essencial e seguro para manter sua sessão ativa. Não usamos cookies de rastreamento ou publicidade.</P>
      <H>8. Segurança</H>
      <P>Adotamos medidas técnicas como criptografia em trânsito (HTTPS), senhas com hash, sessões com expiração e controle de acesso por conta. Nenhum sistema é 100% invulnerável; em caso de incidente relevante, comunicaremos os afetados e a ANPD conforme a lei.</P>
      <H>9. Alterações</H>
      <P>Esta política pode ser atualizada; a data no topo indica a versão vigente.</P>
    </div>
  );
}
