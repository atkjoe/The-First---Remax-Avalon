const users = [
    { name: "Mostafa Elashry", aliases: ["Mostafa"], idCode: "#1", role: "admin", phone: "+20 108 0069523", whatsapp: "https://wh.ms/201080069523" },
    { name: "Rahma Ramadan", aliases: ["Rahma"], idCode: "#2", role: "admin", phone: "01031320203", whatsapp: "https://wa.me/201031320203" },
    { name: "Youssef Yasser", aliases: ["Youssef"], idCode: "#221204#", role: "superadmin", phone: "01020801467", whatsapp: "https://wtsi.me/201020801467" }
];

const defaultContact = {
    name: "The First team",
    role: "admin",
    phone: "01020801467",
    whatsapp: "https://wtsi.me/201020801467"
};

function publicUser(user) {
    if (!user) return null;
    return {
        name: user.name,
        role: user.role,
        phone: user.phone,
        whatsapp: user.whatsapp
    };
}

function normalizeName(name = "") {
    return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function matchesAdminName(user, name) {
    const normalized = normalizeName(name);
    return [user.name, ...(user.aliases || [])].some((item) => normalizeName(item) === normalized);
}

function getAdminNameVariants(name) {
    const user = users.find((item) => matchesAdminName(item, name));
    return user ? [user.name, ...(user.aliases || [])] : [name].filter(Boolean);
}

function getAdminContact(name) {
    const user = users.find((item) => matchesAdminName(item, name));
    return publicUser(user) || defaultContact;
}

function listAdminContacts() {
    return users.map(publicUser);
}

module.exports = {
    users,
    publicUser,
    matchesAdminName,
    getAdminNameVariants,
    getAdminContact,
    listAdminContacts
};
