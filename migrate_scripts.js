import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://aktqvwresyuvoytnjmxn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdHF2d3Jlc3l1dm95dG5qbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDU3MTcsImV4cCI6MjA4MTIyMTcxN30.teOpIyBiYzw_Y2LKxNRAgh2DNNrojL-r0gBWntTKmT4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const newScripts = [
    { title: "Cumprimento — Bom dia", content: `Olá, bom dia! 😊\nMeu nome é Lucas Pedro e darei continuidade ao seu atendimento. Você prefere prosseguir por mensagem ou prefere uma ligação?` },
    { title: "Cumprimento — Boa tarde", content: `Olá, boa tarde! 😊\nMeu nome é Lucas Pedro e darei continuidade ao seu atendimento. Você prefere prosseguir por mensagem ou prefere uma ligação?` },
    { title: "Cumprimento — Boa noite", content: `Olá, boa noite! 😊\nMeu nome é Lucas Pedro e darei continuidade ao seu atendimento. Você prefere prosseguir por mensagem ou prefere uma ligação?` },
    { title: "Procedimento Padrão", content: `Vou realizar alguns procedimentos no sistema para tentar normalizar essa dificuldade.\nPara que as alterações sejam aplicadas corretamente, peço que desconecte os equipamentos da tomada, aguarde cerca de 1 minuto e, em seguida, conecte-os novamente. Tudo bem?` },
    { title: "15 minutos sem contato", content: `Você ainda está aí? Podemos continuar com o seu atendimento?` },
    { title: "Encerramento", content: `Agradecemos pelo seu contato! 😊\nSe tiver dúvidas ou enfrentar qualquer dificuldade, nossa central de atendimento está disponível 24 horas, tanto pelo WhatsApp quanto por telefone.\nSabemos que nem tudo é perfeito, mas pode contar conosco — será um prazer ajudar você! 😉` },
    { title: "Sem resposta", content: `Por falta de contato, estarei encerrando seu atendimento.\nLembre-se: nossa central de atendimento está disponível 24 horas. Na Planalto Net, você nunca está sozinho! 😊\nSabemos que nem tudo é perfeito, mas se surgir qualquer dúvida ou dificuldade, entre em contato — teremos o maior prazer em ajudar. 😉` },
    { title: "Financeiro", content: `Em nosso sistema, consta que está sem conexão devido a uma pendência financeira. Se recorda de ter efetuado o pagamento?` },
    { title: "Em ligação", content: `No momento, estou em outra ligação. Você prefere aguardar um instante ou gostaria de continuar o atendimento por aqui?` },
    { title: "Expediente", content: `No momento meu expediente se encerrou, irei transferir o senhor para o setor técnico e logo em breve será atendido novamente.\nPeço que verifique e nos dê um retorno, estou encerrando meu turno e transferindo seu atendimento para continuidade. 😄` },
    { title: "Teste de Velocidade", content: `Para realizar o teste corretamente:\n1° Desconectar todos os equipamentos da rede\n2° Conectar-se à rede 5G\n3° Ficar próximo ao equipamento\n4° Realizar o teste pelo Speed Test` },
    { title: "Nossos Planos", content: `✨ Nossos Planos ✨\n\n🔹 400 Megas + Deezer\n🎵 Aplicativo de música incluso\n💰 Apenas R$ 80,00\n\n🔹 600 Megas + Watch Brasil OU Deezer\n📺🎵 Você escolhe o benefício\n💰 Apenas R$ 100,00\n\n🔹 1000 Megas (1 Giga) + 2 Pontos Wi-Fi + Telefonia Fixa + Watch Brasil\n🚀 Máxima velocidade e benefícios completos\n💰 Apenas R$ 160,00` },
    { title: "Mensalidade e conexão", content: `Já enviei a sua mensalidade atualizada.😊\nSua conexão está funcionando corretamente ou está enfrentando alguma instabilidade no local?` },
    { title: "Dificuldade Externa", content: `Identificamos que a falta de conexão está sendo causada por uma dificuldade externa.\nNossa equipe técnica já está trabalhando para resolver a situação o mais rápido possível, com previsão de normalização ainda hoje.\nAssim que o serviço for restabelecido, sua conexão retornará automaticamente.` },
    { title: "Relatório Diário", content: `RELATÓRIO MANHÃ/TARDE: 00/00/2025\n\nO.S DE SERVIÇO (TOTAL):\nConexão:\nCortesia:\nAtenuação:\n\nO.S DE SERVIÇO (ABERTAS HOJE):\nConexão:\nCortesia:\nAtenuação:\n\nFluxo de Ligação: \nFluxo de WhatsApp: \nRotas:\nDemandas:\n\nMonitoramento Quedas (TOTAL): --\nMonitoramento Quadro (TOTAL): --\nMonitoramento Sem Conexão (TOTAL): --` },
    { title: "TV Box / IPTV", content: `Equipamentos do tipo TV Box ou IPTV não possuem homologação oficial no Brasil e são considerados irregulares.\nMesmo com a internet funcionando corretamente em outros dispositivos, esses equipamentos podem apresentar falhas, travamentos ou interrupções devido à natureza não regulamentada do serviço.` },
    { title: "Lentidão", content: `Cliente entrou em contato relatando lentidão na conexão. Foram realizados os procedimentos padrão e, após as verificações, a conexão foi normalizada.` },
    { title: "DNS", content: `DNS:\n1 - 177.23.168.19\n2 - 190.109.80.251\n3 - 8.8.8.8` },
    { title: "Rota", content: `Rota:\nLogin referência:\nOutros logins:\nDescrição:\nPonto de referência:\nTelefone:` },
];

async function updateScripts() {
    console.log("Limpando scripts antigos (não-home)...");

    // Deletar todos os scripts que NÃO começam com [HOME]
    const { data: allScripts } = await supabase.from('scripts').select('id, title');
    const idsToDelete = allScripts
        .filter(s => !s.title.startsWith("[HOME]"))
        .map(s => s.id);

    if (idsToDelete.length > 0) {
        await supabase.from('scripts').delete().in('id', idsToDelete);
    }

    console.log("Inserindo novos scripts na ordem correta...");

    for (const script of newScripts) {
        await supabase.from('scripts').insert([script]);
    }

    console.log("Concluído com sucesso!");
}

updateScripts();
