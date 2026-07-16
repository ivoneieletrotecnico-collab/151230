// Usuario administrador inicial do painel FluxoIA.
// A senha NUNCA e armazenada em texto puro: apenas o hash scrypt (salt + digest).
// Hash gerado para a senha definida pelo cliente. Troque a senha apos o primeiro acesso.
export default [
  {
    id: 1,
    email: 'ivoneifs@gmail.com',
    name: 'Ivonei (Admin)',
    role: 'admin',
    passwordHash:
      'scrypt$16384$8$1$2e48fc28114b48b52fc6222b637e898c$6cc9271ccb460d80d6fe30ce3c9e35fc37f52e1fef0667a51d1a5483e5a4af12af439f304f4696d0b1e0a865c128d9c3434e8d01915e0a6c82b1a3f6718b36bb',
    createdAt: '2026-07-15T00:00:00.000Z',
  },
];
