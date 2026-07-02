const users = [
    { name: "Mostafa", idCode: "#1", role: "admin", phone: "+20 108 0069523", whatsapp: "https://wh.ms/201080069523" },
    { name: "Rahma", idCode: "#2", role: "admin", phone: "01031320203", whatsapp: "https://wa.me/201031320203" },
    { name: "Youssef", idCode: "#221204#", role: "superadmin", phone: "01020801467", whatsapp: "https://wtsi.me/201020801467" }
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

function getAdminContact(name) {
    const user = users.find((item) => item.name === name);
    return publicUser(user) || defaultContact;
}

function listAdminContacts() {
    return users.map(publicUser);
}

module.exports = {
    users,
    publicUser,
    getAdminContact,
    listAdminContacts
};
