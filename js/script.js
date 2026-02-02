import { supabase } from './supabaseClient.js';

// ELEMENTOS DE AUTH
const authOverlay = document.getElementById("authOverlay");
const mainApp = document.getElementById("mainApp");
const loginForm = document.getElementById("loginForm");
const signUpForm = document.getElementById("signUpForm");
const toSignUp = document.getElementById("toSignUp");
const toSignIn = document.getElementById("toSignIn");

// INPUTS LOGIN
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const signInBtn = document.getElementById("signInBtn");

// INPUTS CADASTRO
const newNameInput = document.getElementById("newNameInput");
const newEmailInput = document.getElementById("newEmailInput");
const newPasswordInput = document.getElementById("newPasswordInput");
const signUpBtn = document.getElementById("signUpBtn");

// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");

// APP STATE
let currentUser = null;
let currentWorkspace = 'main'; // 'main' ou 'home'
let currentScriptId = null;

// --- LOGICA DE AUTENTICAÇÃO ---

// Alternar entre Login e Cadastro
toSignUp.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("hidden");
    signUpForm.classList.remove("hidden");
});

toSignIn.addEventListener("click", (e) => {
    e.preventDefault();
    signUpForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});

// Cadastrar
signUpBtn.addEventListener("click", async () => {
    const email = newEmailInput.value.trim();
    const password = newPasswordInput.value.trim();
    const name = newNameInput.value.trim();

    if (!email || !password) return alert("Preencha e-mail e senha!");

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
    });

    if (error) alert("Erro ao cadastrar: " + error.message);
    else {
        alert("Cadastro realizado! Verifique seu e-mail (se necessário) e faça login.");
        toSignIn.click();
    }
});

// Entrar
signInBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) alert("Erro ao entrar: " + error.message);
    else {
        currentUser = data.user;
        showApp();
    }
});

// Sair
logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    currentUser = null;
    hideApp();
});

function showApp() {
    authOverlay.classList.add("hidden");
    mainApp.classList.remove("hidden");
    loadCustomScripts();
    loadDailyMessage();
}

function hideApp() {
    authOverlay.classList.remove("hidden");
    mainApp.classList.add("hidden");
    document.querySelectorAll('.custom-script-btn').forEach(el => el.remove());
}

// --- LOGICA DO APP (REVISADA PARA USUÁRIOS) ---

const editor = document.getElementById("editor");
const homeEditor = document.getElementById("homeEditor");
const mainView = document.getElementById("mainView");
const homeView = document.getElementById("homeView");
const mainAside = document.getElementById("mainAside");
const homeAside = document.getElementById("homeAside");

const homeBtn = document.getElementById("homeBtn");
const backToMainBtn = document.getElementById("backToMainBtn");

// Navegação entre Workspaces
homeBtn.addEventListener("click", () => {
    mainView.classList.add("hidden");
    homeView.classList.remove("hidden");
    currentWorkspace = 'home';
    currentScriptId = null;
    loadCustomScripts();
});

backToMainBtn.addEventListener("click", () => {
    homeView.classList.add("hidden");
    mainView.classList.remove("hidden");
    currentWorkspace = 'main';
    currentScriptId = null;
    loadCustomScripts();
});

function insertText(text, scriptId = null) {
    const activeEditor = currentWorkspace === 'main' ? editor : homeEditor;
    activeEditor.value = text;
    currentScriptId = scriptId;

    const activeSaveBtn = currentWorkspace === 'main' ? document.getElementById("saveBtn") : document.getElementById("saveHomeBtn");
    if (scriptId) {
        activeSaveBtn.innerText = "💾 Atualizar";
    } else {
        activeSaveBtn.innerText = "💾 Salvar";
    }
}

async function handleSave() {
    if (!currentUser) return;
    const activeEditor = currentWorkspace === 'main' ? editor : homeEditor;
    const content = activeEditor.value;

    if (currentScriptId) {
        const { error } = await supabase.from('scripts').update({ content }).eq('id', currentScriptId);
        if (error) alert(error.message);
        else alert("💾 Atualizado!");
    } else {
        alert("Use o botão '+ Novo' para salvar novos scripts permanentemente.");
    }
}

document.getElementById("saveBtn").addEventListener("click", handleSave);
document.getElementById("saveHomeBtn").addEventListener("click", handleSave);

// Gerenciar Listagem
async function loadCustomScripts() {
    if (!currentUser) return;
    document.querySelectorAll('.custom-script-btn').forEach(el => el.remove());

    const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('user_id', currentUser.id) // FILTRO POR USUÁRIO
        .order('created_at', { ascending: true });

    if (error) return;

    data.forEach((script, index) => {
        const isHome = script.title.startsWith("[HOME]");
        const container = isHome ? homeAside : mainAside;

        if ((currentWorkspace === 'main' && !isHome) || (currentWorkspace === 'home' && isHome)) {
            const btn = document.createElement("button");
            btn.className = "script-btn custom-script-btn";
            btn.textContent = script.title.replace("[HOME]", "").trim();
            btn.addEventListener("click", () => insertText(script.content, script.id));
            container.appendChild(btn);
        }
    });
}

// Novo Script (Popup)
const popupOverlay = document.getElementById("popupOverlay");
const saveNewScriptBtn = document.getElementById("saveNewScriptBtn");

document.getElementById("newBtn").addEventListener("click", () => popupOverlay.style.display = "block");
document.getElementById("newHomeBtn").addEventListener("click", () => popupOverlay.style.display = "block");
document.getElementById("closePopupBtn").addEventListener("click", () => popupOverlay.style.display = "none");

saveNewScriptBtn.addEventListener("click", async () => {
    let title = document.getElementById("newScriptTitle").value.trim();
    const content = document.getElementById("newScriptText").value.trim();

    if (currentWorkspace === 'home') title = "[HOME] " + title;

    const { error } = await supabase.from('scripts').insert([{
        title,
        content,
        user_id: currentUser.id // VINCULA AO USUÁRIO
    }]);

    if (error) alert(error.message);
    else {
        popupOverlay.style.display = "none";
        loadCustomScripts();
    }
});

// Inicialização
window.addEventListener("load", async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
        currentUser = data.user;
        showApp();
    } else {
        hideApp();
    }
});

/* --- POPUP DO SINO (GLOBAL) --- */
const dailyBtn = document.getElementById("dailyBtn");
const dailyPopup = document.getElementById("dailyPopup");
const dailyMessage = document.getElementById("dailyMessage");
let currentDailyMessage = "";

async function loadDailyMessage() {
    const { data } = await supabase.from('daily_messages').select('content').order('created_at', { ascending: false }).limit(1).single();
    if (data) {
        currentDailyMessage = data.content;
        dailyMessage.value = data.content;
        if (data.content.trim()) dailyBtn.classList.add("has-remember");
    }
}

dailyBtn.addEventListener("click", () => dailyPopup.classList.remove("hidden"));
document.getElementById("closeDailyPopup").addEventListener("click", () => dailyPopup.classList.add("hidden"));
document.getElementById("saveDailyMsg").addEventListener("click", async () => {
    await supabase.from('daily_messages').insert([{ content: dailyMessage.value }]);
    dailyPopup.classList.add("hidden");
    loadDailyMessage();
});
