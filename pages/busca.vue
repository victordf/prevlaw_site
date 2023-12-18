<template>
  <section>
        <default-hero image="/images/default-hero.webp">
            <div class="center | default-hero__content" size="wide">
                <h1 class="default-hero__title">Você buscou por "<span>{{ route.query.termo }}</span>"</h1>
                <div class="breadcrumbs">
                    <nuxt-link to="/" class="breadcrumbs__link">Home</nuxt-link>
                    <span class="material-symbols-outlined">chevron_right</span>
                    <p class="breadcrumbs__link">Busca</p>
                    <span class="material-symbols-outlined">chevron_right</span>
                    <p class="breadcrumbs__current">"{{ route.query.termo }}"</p>
                </div>
            </div>
        </default-hero>
        <section class="lista">
          <div class="center" size="wide">
            <div class="busca__list | grid-3" v-if="data.filteredLista && data.filteredLista.length >= 1">
              <div v-for="post in data.filteredLista" v-bind:key="post.slug">
                <base-card :cardData="post" v-if="post.type == 'noticias'" />
                <base-card :cardData="post" tagColor="accent" linkText="Conheça o benefício" v-else  />
              </div>
            </div>
            <div class="lista__resultados" v-else>
              <div class="lista__vazia">
                <div class="lista__icon">
                  <img src="/images/alert.webp" alt="Aviso" format="webp" />
                </div>
                <div>
                  <p class="lista__title">O termo buscado não trouxe nenhum resultado.</p>
                  <p class="lista__text">Tente novamente com outro termo ou confira os nossos conteúdos mais acessados abaixo.</p>
                </div>
              </div>
              <div class="busca__list | grid-3">
                <div v-for="post in data.maisAcessadas" v-bind:key="post.slug">
                  <base-card :cardData="post" v-if="post.type == 'noticias'" />
                  <base-card :cardData="post" tagColor="accent" linkText="Conheça o benefício" v-else  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <pl-footer></pl-footer>
  </section>
</template>

<script setup>
    import _ from 'lodash';
    const categorias = await queryContent('categorias').find();
    const autores = await queryContent('autores').find();
    const publicacoes = await queryContent('publicacoes').find();
    const beneficios = await queryContent('beneficios').find();
    const revisoes = await queryContent('revisoes').find();
    const maisAcessadas = await queryContent('mais-acessadas').find();
    const route = useRoute()

    const data = reactive({
      lista: [],
      filteredLista: [],
      maisAcessadas: [],
    });

    // Configurar as opções para formatar a data
    let opcoes = { day: 'numeric', month: 'long', year: 'numeric' };

    // Criar um objeto Intl.DateTimeFormat com as opções
    let formatadorData = new Intl.DateTimeFormat('pt-BR', opcoes);

    function findPost(i) {
        let post = publicacoes.find(p => p.slug === i.ref);
        if(!post || post.length <= 0) {
          post = beneficios.find(p => p.slug === i.ref);
        }
        if(!post || post.length <= 0) {
          post = revisoes.find(p => p.slug === i.ref);
        }
        return post
    }

    function buildItem(publicacao) {
        let item = {};
        item.slug = publicacao.slug;
        item.title = publicacao.title;
        item.image = publicacao.cover;
        item.brow = categorias.find(c => c.slug === publicacao.category).name;
        item.type = publicacao.type;
        item.url=`/${item.type}/${item.slug}`;
        let dataObj;
        if(publicacao.atualizacao) {
          dataObj = new Date(publicacao.atualizacao);
        } else {
          dataObj = new Date(publicacao.date);
        }
        item.date = formatadorData.format(dataObj);
        item.atualizado = publicacao.atualizacao? publicacao.atualizacao: publicacao.date;
        return item;
    }

    if(!route.query || (route.query.tudo || route.query.noticias)){
      publicacoes.forEach(element => {
        data.lista.push(buildItem(element));
      });
    }
    
    if(!route.query || (route.query.tudo || route.query.beneficios)){
      beneficios.forEach(element => {
        data.lista.push(buildItem(element));
      });
    }

    if(!route.query || (route.query.tudo || route.query.revisoes)){
      revisoes.forEach(element => {
        data.lista.push(buildItem(element));
      });
    }
    
    data.lista.sort(function(a, b) {
      var dateA = new Date(a.atualizado);
      var dateB = new Date(b.atualizado);

      // Compare the dates
      return dateB - dateA;
    });

    const filterList = (termo) => {
      const searchWords = _.words(termo.toLowerCase());
      const list =  data.lista.filter(item => {
        for (const key in item) {
          // Check if the search term is present in any attribute
          if (_.words(item[key].toLowerCase()).some(word => searchWords.includes(word))) {
            return true; 
          }
        }
        return false;
      });
      list.forEach(element => {
        data.filteredLista.push(element);
      });
    }
    if(route.query && route.query.termo){
      filterList(route.query.termo);
    } else {
      data.filteredLista = data.lista;
    }

  maisAcessadas.forEach(i => {
      data.maisAcessadas.push(buildItem(findPost(i)));
  });
</script>

<style lang="scss" scoped>
  .lista {
    padding-block: 64px 128px;
  }

    .lista__resultados {
        display: flex;
        flex-flow: column nowrap;
        gap: 48px;
    }

    .lista__icon {
      width: 56px;
      height: 56px;
      background-color: #F1E7DB;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      img {
        width: 32px;
      }
    }

    .lista__vazia {
      display: flex;
      flex-flow: row nowrap;
      gap: 24px;
      align-items: center;
      border-block: 1px solid hsla(0, 0%, 0%, 0.15);
      padding-block: 32px;
    }

    .lista__title {
      font-size: 1.375em;
      color: #0054A8;
      font-weight: 500;
    }
</style>