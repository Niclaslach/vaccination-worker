!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e){function n(t){const e=String(t);return String(e.length>7?e.substr(0,e.length-6)+"."+e.substr(e.length-6,3)+"m":e)}addEventListener("fetch",t=>{t.respondWith(async function(t){const{searchParams:e}=new URL(t.url);console.log(e.get("countries"));const r=e.get("countries").split(",");var o=await async function(){const t=await fetch("https://github.com/owid/covid-19-data/raw/master/public/data/vaccinations/vaccinations.json"),e=t.headers.get("server");if([530,503,502,403,400].includes(t.status)&&("cloudflare"===e||!e))return generateJSONResponse({error:`Status ${t.status} requesting ${url}`},pretty);let n=await t.json();console.log(n[0]),console.log(n[0].data.length-1);let r=[];for(country of n)r.push({country:country.country,iso_code:country.iso_code,...country.data[country.data.length-1]});return r}();o=function(t,e){let n=[];for(countryData of t)for(country of e)if(countryData.iso_code==country){n.push(countryData);break}return n}(o,r);const a={DEU:"i44344",DNK:"i44348"};let c=[];for(vaccinationCountryData of o)try{c.push({text:n(vaccinationCountryData.people_vaccinated),duration:3e5,icon:a[vaccinationCountryData.iso_code],goalData:{start:0,current:vaccinationCountryData.people_vaccinated_per_hundred,end:100}})}catch{}return new Response(JSON.stringify({frames:c}),{status:200})}(t.request))})}]);