// Esta linha diz ao TypeScript que qualquer arquivo que termine com ".png"
// deve ser tratado como um módulo válido que pode ser importado no código.
declare module '*.png' {

  // Aqui estamos dizendo que o conteúdo desse módulo pode ser de "qualquer tipo" (any).
  // Isso é necessário porque o TypeScript não sabe, por padrão, o que é retornado
  // ao importar uma imagem — se é uma string, um objeto, etc.
  const content: any;

  // Por fim, estamos exportando esse "content" como exportação padrão (default export),
  // o que nos permite usar:
  // import MinhaImagem from './caminho/da/imagem.png';
  export default content;
}
