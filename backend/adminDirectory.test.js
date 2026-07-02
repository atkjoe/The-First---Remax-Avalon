const test = require("node:test");
const assert = require("node:assert/strict");
const { getAdminContact, listAdminContacts, matchesAdminName, publicUser, users } = require("./adminDirectory");

test("admin contacts are mapped to the correct listing owner", () => {
    assert.equal(getAdminContact("Youssef").phone, "01020801467");
    assert.equal(getAdminContact("Youssef").whatsapp, "https://wtsi.me/201020801467");
    assert.equal(getAdminContact("Youssef Yasser").phone, "01020801467");
    assert.equal(getAdminContact("Mostafa").phone, "+20 108 0069523");
    assert.equal(getAdminContact("Mostafa").whatsapp, "https://wh.ms/201080069523");
    assert.equal(getAdminContact("Mostafa Elashry").phone, "+20 108 0069523");
    assert.equal(getAdminContact("Rahma").phone, "01031320203");
    assert.equal(getAdminContact("Rahma").whatsapp, "https://wa.me/201031320203");
    assert.equal(getAdminContact("Rahma Ramadan").phone, "01031320203");
});

test("public user output never exposes login id codes", () => {
    const user = publicUser(users[0]);
    assert.deepEqual(Object.keys(user).sort(), ["name", "phone", "role", "whatsapp"]);
});

test("the configured admin team uses public full names", () => {
    const contacts = listAdminContacts();
    assert.deepEqual(contacts.map((contact) => contact.name).sort(), ["Mostafa Elashry", "Rahma Ramadan", "Youssef Yasser"]);
    assert.equal(getAdminContact("Youssef").role, "superadmin");
    assert.equal(getAdminContact("Mostafa").role, "admin");
    assert.equal(getAdminContact("Rahma").role, "admin");
    contacts.forEach((contact) => {
        assert.ok(contact.name);
        assert.ok(contact.role === "admin" || contact.role === "superadmin");
        assert.ok(contact.phone);
        assert.ok(contact.whatsapp.startsWith("https://"));
    });
});

test("login names accept old short names and new full names", () => {
    const mostafa = users.find((user) => user.idCode === "#1");
    assert.equal(matchesAdminName(mostafa, "Mostafa"), true);
    assert.equal(matchesAdminName(mostafa, "Mostafa Elashry"), true);
    assert.equal(matchesAdminName(mostafa, "  mostafa   elashry  "), true);
});

test("unknown or old listings still have a visitor contact fallback", () => {
    const contact = getAdminContact("");
    assert.equal(contact.name, "The First team");
    assert.equal(contact.phone, "01020801467");
});
