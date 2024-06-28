export default function decorate(block) {
  const rows = [...block.children];
  //const assetlink = "https://franklin.free.beeceptor.com/assetsList";
  const assetlink = "https://d9181cf76acc425bb57c85b180ff280f.api.mockbin.io/";
  const tabsButtons = document.createElement('div');
  [...block.children].forEach((row,r)=>{
     [...row.children].forEach((col,i)=>{
          if(i==0) {
            /** 
              const linkButton = document.createElement('button');
              linkButton.classList.add('showAssetbtn');
              linkButton.setAttribute("id", r);
              const node = document.createTextNode(col.innerHTML);
              linkButton.append(node);
              col.replaceWith(linkButton);
            **/  
              const fetchCall = fetch(assetlink);
              fetchCall
              .then((response) => response.json())
              .then((data) => {
                  populateAssets(data.results);
              });

          } else {
              col.classList.add("assetDataList");
          }
     });
  });
  document.getElementsByClassName('assetslist')[0].setAttribute('align','center');

  /**
   * document.getElementsByClassName('assetslist')[0].addEventListener('click', (event)=>{
      if(event.target.classList.value == "showAssetbtn") {
          const fetchCall = fetch(assetlink);
          
          fetchCall
              .then((response) => response.json())
              .then((data) => {
                  populateAssets(data.results);
              });
      }
  });
  **/

  function populateAssets(results) {
      var assetsSection = document.createElement('div');
      results.forEach(asset => {
          var assetDiv = document.createElement('div');
          assetDiv.classList.add('assetBlock');
          var titleHeading = document.createElement('h5');
          titleHeading.classList.add('titleHeading');
          titleHeading.innerHTML=asset.title;
          var para = document.createElement('p');
          para.classList.add('titleDesc');
          para.innerHTML=asset.desc;
          var download = document.createElement('a');
          download.setAttribute('href', asset.link);
          download.setAttribute('target','_blank');
          download.innerHTML = "View Asset";
          download.classList.add('viewAsset');
          download.setAttribute('download', '');
          assetDiv.appendChild(titleHeading);
          assetDiv.appendChild(para);
          assetDiv.appendChild(download);
          assetsSection.appendChild(assetDiv);
      });
      document.getElementsByClassName("assetDataList")[0].appendChild(assetsSection);
  }
}