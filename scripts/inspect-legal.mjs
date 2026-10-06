import {load} from 'cheerio';import {readFile} from 'node:fs/promises';
for(const slug of ['terms-of-service','privacy-policy']) {
 const $=load(await readFile(`content/source/pages/${slug}.html`,'utf8'));
 const h=$('h2').first();console.log(slug);
 console.log(h.parents().map((i,e)=>({tag:e.name,class:$(e).attr('class'),length:$(e).text().length})).get().slice(0,6));
 console.log(h.parent().parent().html()?.slice(0,2500));
}
const $=load(await readFile('content/source/pages/reviews.html','utf8'));
console.log($('.testimonial-heading').first().parent().parent().html()?.slice(0,6000));
