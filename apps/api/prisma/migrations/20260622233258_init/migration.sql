-- CreateTable
CREATE TABLE "Unidade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "bloco" TEXT NOT NULL,
    "proprietario" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Receita" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "dataPagamento" DATETIME,
    "unidadeId" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    CONSTRAINT "Receita_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Despesa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL,
    "categoria" TEXT NOT NULL,
    "fornecedor" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "OrcamentoLote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "versao" INTEGER NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT
);

-- CreateTable
CREATE TABLE "Orcamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoria" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor" REAL NOT NULL,
    "loteId" INTEGER NOT NULL,
    CONSTRAINT "Orcamento_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "OrcamentoLote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Orcamento_categoria_mes_ano_loteId_key" ON "Orcamento"("categoria", "mes", "ano", "loteId");
