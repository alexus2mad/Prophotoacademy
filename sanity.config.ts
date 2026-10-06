'use client';
import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {presentationTool} from 'sanity/presentation';
import {schemaTypes} from './sanity/schemaTypes';
export default defineConfig({name:'prophoto',title:'Pro Photo Academy',projectId:process.env.NEXT_PUBLIC_SANITY_PROJECT_ID||'unconfigured',dataset:process.env.NEXT_PUBLIC_SANITY_DATASET||'production',basePath:'/studio',plugins:[structureTool({structure:S=>S.list().title('Academy content').items([S.listItem().title('Site settings').child(S.document().schemaType('siteSettings').documentId('site-settings')), ...S.documentTypeListItems().filter(item=>item.getId()!=='siteSettings')])}),presentationTool({previewUrl:{origin:process.env.NEXT_PUBLIC_SITE_URL||'http://127.0.0.1:3000',previewMode:{enable:'/api/draft'}}})],schema:{types:schemaTypes}});

