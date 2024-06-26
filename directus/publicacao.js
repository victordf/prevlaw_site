import fs from "fs";
import rimraf from "rimraf";
import common from "./common.js";
import { DOMParser } from 'xmldom';

let files = await common.getDirectusAssets();

const objectContructor = async (dir, fs) => {
  let peticoes = await common.getDirectusData("publicacao");
  
  peticoes.forEach(async (item, num) => {
    let i = { ...item };
    i.slug = common.slugify(item.titulo);
    i.capa = await common.getImage(item.capa.id);
    i.type = 'noticias'
    i.categoriaSlug = common.slugify(item.categoria.titulo)
    i.autorSlug = common.slugify(item.autor.nome)
    i.autor.picture = await common.getImage(item.autor.picture)
    let firstParagraph = '';
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(i.conteudo, 'text/html');
    let paragraphs = htmlDoc.getElementsByTagName('p');
    if(paragraphs.length <= 0) {
      paragraphs = htmlDoc.getElementsByTagName('span');
    }
    if (paragraphs.length > 0) {
      firstParagraph = paragraphs[0].textContent.trim();
    }
    i.excerpt = firstParagraph;
    common.replaceImageUrls(i.conteudo).then(result => {
      i.conteudo = result;
      fs.writeFile(
        `${dir}/${i.slug}.json`,
        JSON.stringify(i),
        function (err) {
          if (err) console.log("error", err);
        }
      );
      console.log("ESCREVENDO PUBLICACAO: ", i.slug + ".json");
    }).catch(err => {
      console.error(err);
    });
  });
}

const getPublicacoes = async () => {
  
  const dir = "./content/publicacoes";
  if (fs.existsSync(dir)) {
    rimraf(dir, async () => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      fs.access(dir, fs.constants.R_OK | fs.constants.W_OK, async (err) => {
        if (err) {
          console.log(err);
        } else {
          objectContructor(dir, fs);
        }
      });
    });
  } else {
    if (!fs.existsSync("./content")) {
      fs.mkdirSync("./content");
    }
    fs.mkdirSync(dir);
    fs.access(dir, fs.constants.R_OK | fs.constants.W_OK, async (err) => {
      if (err) {
        console.log(err);
      } else {
        objectContructor(dir, fs);
      }
    });
  }
}


export default getPublicacoes
