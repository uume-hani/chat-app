let currentUser = {
    name: 'Alex Johnson',
    email: 'alex.johnson@whatsapp.web',
    bio: 'Available | Coding 🚀',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    blocked: []
};

let activeChatId = null;
let currentFilter = 'all';
let isVoiceRecording = false;
let recordingTimerInterval = null;
let recordingSeconds = 0;
let activeStoryIndex = 0;

let chats = [
    {
        id: 'c1',
        name: 'Zaid Khan',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        bio: 'At work 💻',
        type: 'direct',
        unread: 2,
        favourite: true,
        archived: false,
        online: true,
        blocked: false,
        disappearing: false,
        messages: [
            { id: 'm1', sender: 'them', text: 'Hey Alex! Ready for final submission?', time: '2:10 PM', status: 'read' },
            { id: 'm2', sender: 'me', text: 'Yes, all requirements are built and running!', time: '2:12 PM', status: 'read' },
            { id: 'm3', sender: 'them', text: 'Awesome! Send me an audio note.', time: '2:15 PM', status: 'unread' }
        ]
    },
    {
        id: 'c2',
        name: 'Web Developers Group',
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150',
        bio: 'Community Group',
        type: 'group',
        unread: 0,
        favourite: false,
        archived: false,
        online: true,
        blocked: false,
        disappearing: false,
        members: ['Alex Johnson', 'Zaid Khan', 'Sara Ahmed'],
        seenBy: ['Zaid Khan', 'Sara Ahmed'],
        messages: [
            { id: 'gm1', sender: 'Sara Ahmed', text: 'All features look outstanding!', time: '1:30 PM', status: 'read' }
        ]
    },
    {
        id: 'c3',
        name: 'Meta AI Assistant',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        bio: 'Automated AI Bot',
        type: 'ai',
        unread: 0,
        favourite: true,
        archived: false,
        online: true,
        blocked: false,
        disappearing: false,
        messages: [
            { id: 'aim1', sender: 'them', text: 'Hello! I am Meta AI. How can I assist you?', time: '12:00 PM', status: 'read' }
        ]
    }
];

let statusStories = [
    {
        id: 's1',
        userName: 'Zaid Khan',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        photo: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
        text: 'Coding sprint in progress! 🚀',
        likes: 5,
        views: 18,
        liked: false,
        comments: [
            { user: 'Sara Ahmed', text: 'Good luck! 🔥', time: '1:45 PM' }
        ]
    }
];

let callLogs = [
    { name: 'Zaid Khan', time: 'Today, 2:15 PM', type: 'incoming', video: false }
];

document.addEventListener('DOMContentLoaded', () => {
    updateProfileUI();
    renderChatList();
    renderStatusList();
    renderCallLogs();
});

function switchAuthTab(tab) {
    if (tab === 'login') {
        document.getElementById('auth-login-pane').classList.remove('hidden');
        document.getElementById('auth-signup-pane').classList.add('hidden');
        document.getElementById('auth-tab-login').className = 'flex-1 py-2.5 text-xs font-bold rounded-xl bg-wa-emerald text-white shadow-lg transition';
        document.getElementById('auth-tab-signup').className = 'flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-400 hover:text-white transition';
    } else {
        document.getElementById('auth-login-pane').classList.add('hidden');
        document.getElementById('auth-signup-pane').classList.remove('hidden');
        document.getElementById('auth-tab-signup').className = 'flex-1 py-2.5 text-xs font-bold rounded-xl bg-wa-emerald text-white shadow-lg transition';
        document.getElementById('auth-tab-login').className = 'flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-400 hover:text-white transition';
    }
}

function performAuth(type) {
    if (type === 'signup') {
        const name = document.getElementById('signup-name').value;
        const bio = document.getElementById('signup-bio').value;
        const avatar = document.getElementById('signup-avatar').value;
        if (name) currentUser.name = name;
        if (bio) currentUser.bio = bio;
        if (avatar) currentUser.avatar = avatar;
    }
    updateProfileUI();
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    showToast('Logged in successfully!');
}

function updateProfileUI() {
    document.getElementById('my-avatar-display').src = currentUser.avatar;
    document.getElementById('my-name-display').innerText = currentUser.name;
    document.getElementById('my-status-avatar').src = currentUser.avatar;
    document.getElementById('modal-profile-avatar').src = currentUser.avatar;
    document.getElementById('modal-profile-avatar-input').value = currentUser.avatar;
    document.getElementById('modal-profile-name').value = currentUser.name;
    document.getElementById('modal-profile-bio').value = currentUser.bio;
}

function openProfileModal() { openModal('profile-modal'); }
function saveProfileChanges() {
    const name = document.getElementById('modal-profile-name').value;
    const bio = document.getElementById('modal-profile-bio').value;
    const avatar = document.getElementById('modal-profile-avatar-input').value;
    if (name) currentUser.name = name;
    if (bio) currentUser.bio = bio;
    if (avatar) currentUser.avatar = avatar;
    updateProfileUI();
    closeModal('profile-modal');
    showToast('Profile & DP updated successfully!');
}

function switchTab(tab) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
}

function renderChatList() {
    const container = document.getElementById('tab-chats');
    container.innerHTML = '';

    const filtered = chats.filter(c => {
        if (currentFilter === 'unread') return c.unread > 0;
        if (currentFilter === 'favourites') return c.favourite;
        if (currentFilter === 'groups') return c.type === 'group';
        if (currentFilter === 'archived') return c.archived;
        return !c.archived;
    });

    filtered.forEach(chat => {
        const lastMsg = chat.messages[chat.messages.length - 1] || { text: 'No messages yet', time: '' };
        const activeClass = chat.id === activeChatId ? 'bg-wa-darkHover' : '';

        const item = document.createElement('div');
        item.className = `p-3.5 flex items-center justify-between cursor-pointer hover:bg-wa-darkHover transition ${activeClass}`;
        item.onclick = () => openChat(chat.id);

        item.innerHTML = `
            <div class="flex items-center gap-3 truncate">
                <div class="relative shrink-0">
                    <img src="${chat.avatar}" class="w-12 h-12 rounded-full object-cover">
                    ${chat.online ? '<span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-wa-emerald border-2 border-wa-darkBg"></span>' : ''}
                </div>
                <div class="truncate">
                    <h4 class="font-bold text-sm text-slate-100 flex items-center gap-1">${chat.name} ${chat.favourite ? '<i class="fa-solid fa-star text-amber-400 text-[10px]"></i>' : ''}</h4>
                    <p class="text-xs text-slate-400 truncate mt-0.5">${lastMsg.text}</p>
                </div>
            </div>
            <div class="text-right shrink-0">
                <span class="text-[10px] text-slate-500">${lastMsg.time}</span>
                ${chat.unread > 0 ? `<span class="block mt-1 bg-wa-emerald text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ml-auto">${chat.unread}</span>` : ''}
            </div>
        `;
        container.appendChild(item);
    });
}

function setFilter(filter) {
    currentFilter = filter;
    ['all', 'unread', 'favourites', 'groups', 'archived'].forEach(f => {
        const btn = document.getElementById(`filter-btn-${f}`);
        if (btn) {
            if (f === filter) {
                btn.className = 'px-3 py-1 rounded-full bg-wa-emerald text-white font-semibold shrink-0';
            } else {
                btn.className = 'px-3 py-1 rounded-full bg-wa-darkHeader text-slate-300 hover:bg-wa-darkHover shrink-0';
            }
        }
    });
    renderChatList();
}

function filterChats(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('#tab-chats > div').forEach(el => {
        const text = el.innerText.toLowerCase();
        el.style.display = text.includes(q) ? 'flex' : 'none';
    });
}

function openChat(id) {
    activeChatId = id;
    const chat = chats.find(c => c.id === id);
    if (!chat) return;

    chat.unread = 0;
    renderChatList();

    document.getElementById('no-chat-selected').classList.add('hidden');
    document.getElementById('chat-avatar').src = chat.avatar;
    document.getElementById('chat-title').innerText = chat.name;
    
    let subtitle = chat.online ? 'Online' : 'Offline';
    if (chat.type === 'group') {
        subtitle = `${chat.members.length} members. Seen by: ${(chat.seenBy || []).join(', ') || 'None'}`;
    }
    document.getElementById('chat-subtitle').innerText = subtitle;

    renderMessages();
}

function renderMessages() {
    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;

    const container = document.getElementById('messages-container');
    container.innerHTML = '';

    chat.messages.forEach((msg, idx) => {
        const isMe = msg.sender === 'me';
        const msgDiv = document.createElement('div');
        msgDiv.className = `flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`;

        let bodyHTML = `<p class="text-xs text-slate-100">${msg.text}</p>`;

        if (msg.type === 'voice') {
            bodyHTML = `
                <div class="flex items-center gap-3 py-1">
                    <button class="w-8 h-8 rounded-full bg-wa-emerald text-white flex items-center justify-center text-xs"><i class="fa-solid fa-play"></i></button>
                    <div class="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden"><div class="w-1/2 h-full bg-wa-emerald"></div></div>
                    <span class="text-[10px] text-slate-400">0:12</span>
                </div>
            `;
        } else if (msg.type === 'image') {
            bodyHTML = `<img src="${msg.mediaUrl}" class="rounded-lg max-w-xs mb-1 shadow"><p class="text-xs text-slate-100">${msg.text || ''}</p>`;
        } else if (msg.type === 'video') {
            bodyHTML = `<video src="${msg.mediaUrl}" controls class="rounded-lg max-w-xs mb-1 shadow"></video><p class="text-xs text-slate-100">${msg.text || ''}</p>`;
        } else if (msg.type === 'document') {
            bodyHTML = `
                <div class="flex items-center gap-3 bg-wa-darkBg p-2 rounded-xl border border-wa-darkBorder">
                    <i class="fa-solid fa-file-pdf text-red-400 text-2xl"></i>
                    <div>
                        <p class="font-bold text-xs text-white">${msg.fileName || 'Document.pdf'}</p>
                        <span class="text-[9px] text-slate-400">PDF • 2.4 MB</span>
                    </div>
                </div>
            `;
        } else if (msg.type === 'poll') {
            bodyHTML = `
                <div class="space-y-1.5 min-w-[200px]">
                    <p class="font-bold text-xs text-wa-emerald">${msg.question}</p>
                    ${msg.options.map(opt => `<button onclick="votePoll('${msg.id}', '${opt}')" class="w-full text-left p-1.5 bg-wa-darkBg rounded-lg text-xs hover:bg-wa-darkHover border border-wa-darkBorder">${opt}</button>`).join('')}
                </div>
            `;
        } else if (msg.type === 'event') {
            bodyHTML = `
                <div class="bg-indigo-950/80 p-3 rounded-xl border border-indigo-500/30 space-y-1">
                    <div class="flex items-center gap-2 text-indigo-400 font-bold text-xs"><i class="fa-solid fa-calendar-days"></i> ${msg.eventTitle}</div>
                    <p class="text-[11px] text-slate-300">Scheduled Date: ${msg.eventDate}</p>
                </div>
            `;
        }

        let reactionsHTML = '';
        if (msg.reaction) {
            reactionsHTML = `<span class="absolute -bottom-2 right-2 bg-wa-darkHeader text-xs px-1.5 py-0.5 rounded-full border border-wa-darkBorder shadow">${msg.reaction}</span>`;
        }

        msgDiv.innerHTML = `
            <div class="${isMe ? 'bg-wa-emeraldDark/80 rounded-tr-none' : 'bg-wa-darkHeader rounded-tl-none'} rounded-2xl p-3 max-w-sm border border-wa-darkBorder shadow-md relative group">
                ${bodyHTML}
                ${reactionsHTML}
                <div class="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-400">
                    <span>${msg.time}</span>
                    ${isMe ? '<i class="fa-solid fa-check-double text-wa-accentBlue"></i>' : ''}
                    <div class="hidden group-hover:flex items-center gap-1.5 ml-2 bg-slate-900/95 px-2 py-0.5 rounded shadow">
                        <button onclick="reactMsg(${idx}, '❤️')" title="React">❤️</button>
                        <button onclick="reactMsg(${idx}, '👍')" title="React">👍</button>
                        <button onclick="editMsg(${idx})" title="Edit"><i class="fa-solid fa-pen text-blue-400"></i></button>
                        <button onclick="copyMsg('${msg.text || 'Media'}')" title="Copy"><i class="fa-solid fa-copy text-green-400"></i></button>
                        <button onclick="forwardMsg(${idx})" title="Forward"><i class="fa-solid fa-share text-amber-400"></i></button>
                        <button onclick="pinMsg(${idx})" title="Pin"><i class="fa-solid fa-thumbtack text-purple-400"></i></button>
                        <button onclick="deleteMsg(${idx}, 'me')" title="Delete for me"><i class="fa-solid fa-trash text-orange-400"></i></button>
                        ${isMe ? `<button onclick="deleteMsg(${idx}, 'everyone')" title="Delete for everyone"><i class="fa-solid fa-ban text-red-500"></i></button>` : ''}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(msgDiv);
    });

    container.scrollTop = container.scrollHeight;
}

function sendTextMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !activeChatId) return;

    const chat = chats.find(c => c.id === activeChatId);
    if (chat.blocked) {
        showToast('Cannot send message. User is blocked.');
        return;
    }

    const newMsg = {
        id: 'm_' + Date.now(),
        sender: 'me',
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
    };

    chat.messages.push(newMsg);
    input.value = '';
    renderMessages();
    renderChatList();

    if (chat.type === 'ai') {
        setTimeout(() => {
            chat.messages.push({
                id: 'm_ai_' + Date.now(),
                sender: 'them',
                text: '🤖 Meta AI: Processed prompt: "' + text + '". All features are fully operational!',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'read'
            });
            renderMessages();
            renderChatList();
        }, 800);
    }
}

function reactMsg(idx, emoji) {
    const chat = chats.find(c => c.id === activeChatId);
    chat.messages[idx].reaction = emoji;
    renderMessages();
}

function editMsg(idx) {
    const chat = chats.find(c => c.id === activeChatId);
    const newText = prompt('Edit message text:', chat.messages[idx].text);
    if (newText !== null) {
        chat.messages[idx].text = newText + ' (edited)';
        renderMessages();
        showToast('Message updated');
    }
}

function copyMsg(text) {
    navigator.clipboard.writeText(text);
    showToast('Message copied to clipboard!');
}

function forwardMsg(idx) {
    const targetName = prompt('Forward to contact name:');
    if (targetName) {
        showToast(`Message forwarded to ${targetName}`);
    }
}

function pinMsg(idx) {
    const chat = chats.find(c => c.id === activeChatId);
    const msg = chat.messages[idx];
    document.getElementById('pinned-text').innerText = msg.text || 'Media Message';
    document.getElementById('pinned-banner').classList.remove('hidden');
    showToast('Message pinned!');
}

function unpinMessage() {
    document.getElementById('pinned-banner').classList.add('hidden');
}

function deleteMsg(idx, mode) {
    const chat = chats.find(c => c.id === activeChatId);
    if (mode === 'everyone') {
        chat.messages[idx].text = '🚫 This message was deleted for everyone.';
        chat.messages[idx].type = 'text';
    } else {
        chat.messages.splice(idx, 1);
    }
    renderMessages();
    showToast(mode === 'everyone' ? 'Deleted for everyone' : 'Deleted for me');
}

function startVoiceRecording() {
    isVoiceRecording = true;
    recordingSeconds = 0;
    document.getElementById('voice-recording-overlay').classList.remove('hidden');
    recordingTimerInterval = setInterval(() => {
        recordingSeconds++;
        const mins = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
        const secs = String(recordingSeconds % 60).padStart(2, '0');
        document.getElementById('recording-timer').innerText = `${mins}:${secs}`;
    }, 1000);
}

function cancelVoiceRecording() {
    clearInterval(recordingTimerInterval);
    isVoiceRecording = false;
    document.getElementById('voice-recording-overlay').classList.add('hidden');
    showToast('Recording discarded');
}

function pauseResumeVoiceRecording() {
    const btn = document.getElementById('pause-rec-btn');
    if (recordingTimerInterval) {
        clearInterval(recordingTimerInterval);
        recordingTimerInterval = null;
        btn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
    } else {
        recordingTimerInterval = setInterval(() => { recordingSeconds++; }, 1000);
        btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    }
}

function stopAndSendVoiceRecording() {
    cancelVoiceRecording();
    if (!activeChatId) return;
    const chat = chats.find(c => c.id === activeChatId);
    chat.messages.push({
        id: 'm_v_' + Date.now(),
        sender: 'me',
        type: 'voice',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
    });
    renderMessages();
    renderChatList();
    showToast('Voice note sent!');
}

function toggleAttachMenu() { document.getElementById('attach-menu').classList.toggle('hidden'); }
function toggleEmojiPicker() { document.getElementById('emoji-picker').classList.toggle('hidden'); }
function insertEmoji(emoji) { document.getElementById('chat-input').value += emoji; }

function triggerQuickImageUpload() {
    toggleAttachMenu();
    // One-click default beautiful image upload simulator
    const defaultImages = [
        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'
    ];
    const randomImg = defaultImages[Math.floor(Math.random() * defaultImages.length)];
    
    if (!activeChatId) return;
    const chat = chats.find(c => c.id === activeChatId);
    chat.messages.push({
        id: 'm_img_' + Date.now(),
        sender: 'me',
        type: 'image',
        mediaUrl: randomImg,
        text: '📸 One-click shared image',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
    });
    renderMessages();
    showToast('Image attached and sent instantly!');
}

function triggerQuickVideoUpload() {
    toggleAttachMenu();
    const url = prompt('Enter MP4 Video URL:');
    if (!url || !activeChatId) return;
    const chat = chats.find(c => c.id === activeChatId);
    chat.messages.push({
        id: 'm_vid_' + Date.now(),
        sender: 'me',
        type: 'video',
        mediaUrl: url,
        text: 'Video attachment',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
    });
    renderMessages();
}

function triggerDocumentUpload() {
    toggleAttachMenu();
    const name = prompt('Enter Document Name:', 'Hackathon_Project_Report.pdf');
    if (!name || !activeChatId) return;
    const chat = chats.find(c => c.id === activeChatId);
    chat.messages.push({
        id: 'm_doc_' + Date.now(),
        sender: 'me',
        type: 'document',
        fileName: name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
    });
    renderMessages();
}

function shareLocationCard() {
    toggleAttachMenu();
    if (!activeChatId) return;
    const chat = chats.find(c => c.id === activeChatId);
    chat.messages.push({
        id: 'm_loc_' + Date.now(),
        sender: 'me',
        text: '📍 Shared Live Location: Karachi Tech Hub',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
    });
    renderMessages();
}

function openPollCreator() { toggleAttachMenu(); openModal('poll-modal'); }
function submitPollMessage() {
    const q = document.getElementById('poll-question').value;
    const o1 = document.getElementById('poll-opt-1').value;
    const o2 = document.getElementById('poll-opt-2').value;
    if (!q || !o1 || !o2 || !activeChatId) return;

    const chat = chats.find(c => c.id === activeChatId);
    chat.messages.push({
        id: 'm_poll_' + Date.now(),
        sender: 'me',
        type: 'poll',
        question: q,
        options: [o1, o2],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
    });
    closeModal('poll-modal');
    renderMessages();
}

function openEventCreator() { toggleAttachMenu(); openModal('event-modal'); }
function submitEventMessage() {
    const title = document.getElementById('event-title').value;
    const date = document.getElementById('event-date').value;
    if (!title || !date || !activeChatId) return;
    const chat = chats.find(c => c.id === activeChatId);
    chat.messages.push({
        id: 'm_ev_' + Date.now(),
        sender: 'me',
        type: 'event',
        eventTitle: title,
        eventDate: date,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
    });
    closeModal('event-modal');
    renderMessages();
}

function toggleBlockUser() {
    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;
    chat.blocked = !chat.blocked;
    showToast(chat.blocked ? 'User blocked successfully' : 'User unblocked');
}

function toggleDisappearingMessages() {
    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;
    chat.disappearing = !chat.disappearing;
    showToast(chat.disappearing ? 'Disappearing messages enabled (24h)' : 'Disappearing messages disabled');
}

function changeTheme(mode) {
    const body = document.getElementById('app-body');
    if (mode === 'light') {
        body.className = 'bg-slate-200 text-slate-800 h-screen w-screen overflow-hidden flex justify-center items-center';
        showToast('Switched to Light Theme');
    } else {
        body.className = 'bg-slate-950 text-slate-100 h-screen w-screen overflow-hidden flex justify-center items-center';
        showToast('Switched to Dark Theme');
    }
}

function changeWallpaper(wpClass) {
    const container = document.getElementById('messages-container');
    container.className = `flex-1 overflow-y-auto p-4 space-y-3 relative ${wpClass}`;
    showToast('Chat wallpaper updated!');
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function openSaveContactModal() { openModal('save-contact-modal'); }
function submitSaveContact() {
    const name = document.getElementById('contact-name').value;
    if (!name) return;
    chats.push({
        id: 'c_' + Date.now(),
        name: name,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        type: 'direct',
        unread: 0,
        online: true,
        messages: []
    });
    closeModal('save-contact-modal');
    renderChatList();
    showToast('Contact added!');
}

function openCreateGroupModal() {
    const container = document.getElementById('group-members-picker');
    container.innerHTML = chats.map(c => `<label class="block text-xs text-slate-200"><input type="checkbox" value="${c.name}"> ${c.name}</label>`).join('');
    openModal('create-group-modal');
}

function submitCreateGroup() {
    const title = document.getElementById('group-title').value;
    if (!title) return;
    chats.push({
        id: 'cg_' + Date.now(),
        name: title,
        avatar: document.getElementById('group-icon').value,
        type: 'group',
        unread: 0,
        online: true,
        members: [currentUser.name, 'Zaid Khan', 'Sara Ahmed'],
        seenBy: ['Zaid Khan'],
        messages: []
    });
    closeModal('create-group-modal');
    renderChatList();
    showToast('Group created successfully!');
}

function openQrJoinModal() { openModal('qr-join-modal'); }
function simulateQrJoin() {
    closeModal('qr-join-modal');
    chats.push({
        id: 'cg_qr_' + Date.now(),
        name: 'Hackathon VIP Community',
        avatar: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=150',
        type: 'group',
        unread: 1,
        online: true,
        members: [currentUser.name, 'Zaid Khan', 'Admin'],
        seenBy: ['Zaid Khan'],
        messages: [
            { id: 'mqr1', sender: 'Admin', text: 'Welcome via QR code scanner!', time: '3:00 PM', status: 'read' }
        ]
    });
    renderChatList();
    showToast('Successfully joined group via QR Scanner!');
}

function renderStatusList() {
    const container = document.getElementById('status-stories-list');
    container.innerHTML = statusStories.map((s, idx) => `
        <div onclick="viewStatus(${idx})" class="flex items-center gap-3 p-2 bg-wa-darkHeader rounded-xl cursor-pointer hover:bg-wa-darkHover transition">
            <img src="${s.avatar}" class="w-10 h-10 rounded-full object-cover border-2 border-wa-emerald">
            <div>
                <p class="font-bold text-xs text-white">${s.userName}</p>
                <p class="text-[10px] text-slate-400">Click to view story</p>
            </div>
        </div>
    `).join('');
}

function viewStatus(idx) {
    activeStoryIndex = idx;
    const s = statusStories[idx];
    document.getElementById('story-viewer-avatar').src = s.avatar;
    document.getElementById('story-viewer-name').innerText = s.userName;
    
    const photoEl = document.getElementById('story-photo-content');
    if (s.photo) {
        photoEl.src = s.photo;
        photoEl.classList.remove('hidden');
    } else {
        photoEl.classList.add('hidden');
    }

    document.getElementById('story-text-content').innerText = s.text || '';
    document.getElementById('story-likes-count').innerText = s.likes;
    document.getElementById('story-views-count').innerText = s.views + ' views';
    document.getElementById('status-like-icon').className = s.liked ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart';
    renderStatusComments();
    openModal('story-viewer-modal');
}

function renderStatusComments() {
    const s = statusStories[activeStoryIndex];
    const container = document.getElementById('story-comments-list');
    if (!s.comments || s.comments.length === 0) {
        container.innerHTML = '<p class="text-[10px] text-slate-500 italic">No comments yet. Send a reply!</p>';
        return;
    }
    container.innerHTML = s.comments.map(c => `
        <div class="bg-wa-darkBg p-2 rounded-lg border border-wa-darkBorder">
            <span class="font-bold text-wa-emerald text-[11px]">${c.user}:</span> <span class="text-white">${c.text}</span>
            <span class="block text-[9px] text-slate-500 text-right">${c.time}</span>
        </div>
    `).join('');
}

function likeCurrentStatus() {
    const s = statusStories[activeStoryIndex];
    s.liked = !s.liked;
    s.likes += s.liked ? 1 : -1;
    document.getElementById('story-likes-count').innerText = s.likes;
    document.getElementById('status-like-icon').className = s.liked ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart';
}

function sendDirectStatusReply() {
    const text = document.getElementById('status-reply-input').value.trim();
    if (!text) return;
    const s = statusStories[activeStoryIndex];
    if (!s.comments) s.comments = [];
    s.comments.push({ user: currentUser.name, text: text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    document.getElementById('status-reply-input').value = '';
    renderStatusComments();
    showToast('Reply sent to status owner!');
}

function submitNewStatus() {
    const text = document.getElementById('status-text-input').value;
    const media = document.getElementById('status-media-input').value;
    if (!text && !media) return;
    statusStories.push({
        id: 's_' + Date.now(),
        userName: currentUser.name,
        avatar: currentUser.avatar,
        photo: media || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
        text: text,
        likes: 0,
        views: 1,
        comments: []
    });
    closeModal('add-status-modal');
    renderStatusList();
    showToast('Status posted successfully!');
}

function openAddStatusModal() { openModal('add-status-modal'); }

function startCall(type) {
    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) {
        showToast('Open a conversation first to make a call.');
        return;
    }
    document.getElementById('call-user-avatar').src = activeChat.avatar;
    document.getElementById('call-user-name').innerText = activeChat.name;
    document.getElementById('call-status-lbl').innerText = type === 'video' ? 'Connecting secure video call...' : 'Calling audio note...';
    openModal('call-modal');
}
function endCall() { closeModal('call-modal'); }
function clearCallHistory() {
    document.getElementById('calls-list-container').innerHTML = '<p class="text-xs text-slate-500 italic p-2">Call history cleared</p>';
    showToast('Call log cleared');
}
function openSettingsModal() { openModal('settings-modal'); }
function openAIChatSession() {
    const aiChat = chats.find(c => c.type === 'ai');
    if (aiChat) openChat(aiChat.id);
    switchTab('chats');
}
function openActiveContactInfo() { showToast('Displaying contact details & shared media'); }
function toggleFavouriteActiveChat() {
    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;
    chat.favourite = !chat.favourite;
    showToast(chat.favourite ? 'Added to Favourites' : 'Removed from Favourites');
    renderChatList();
}
function toggleArchiveActiveChat() {
    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;
    chat.archived = !chat.archived;
    showToast(chat.archived ? 'Chat archived' : 'Chat unarchived');
    renderChatList();
}
function clearChatMessages() {
    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;
    chat.messages = [];
    renderMessages();
    showToast('Chat history cleared');
}
function votePoll(msgId, opt) {
    showToast(`Voted successfully for: ${opt}`);
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'bg-wa-emerald text-white text-xs px-4 py-2 rounded-xl shadow-2xl';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}