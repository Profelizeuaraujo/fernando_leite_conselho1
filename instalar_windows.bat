@echo off
echo =========================================
echo   INSTALADOR - CONSELHO DE CLASSE APP
echo =========================================
echo.
echo ATENCAO: Antes de continuar, certifique-se de que:
echo 1. O Node.js esta instalado
echo 2. O PostgreSQL esta instalado
echo 3. Voce criou o arquivo .env com as senhas corretas do banco
echo.
pause

echo.
echo 1. Instalando dependencias do sistema...
call npm install

echo.
echo 2. Configurando o banco de dados (tabelas)...
call npx drizzle-kit push --config=src/db/drizzle.config.ts

echo.
echo 3. Criando usuario gestor inicial...
call npm run seed

echo.
echo 4. Otimizando o sistema (Build)...
call npm run build

echo.
echo =========================================
echo INSTALACAO CONCLUIDA COM SUCESSO!
echo =========================================
echo Para ligar o sistema daqui pra frente, use o arquivo iniciar_windows.bat
echo.
pause
