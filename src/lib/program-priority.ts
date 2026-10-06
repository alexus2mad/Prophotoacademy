import type {AcademyContent,Program} from './types';

export function primaryProgram(content:AcademyContent){
  return content.programs.find(program=>program.id===content.settings.primaryProgramId&&program.category==='course');
}

// Move the selected course to the front without changing editorial order elsewhere.
export function prioritizePrograms(programs:Program[],primaryProgramId?:string){
  const selected=programs.find(program=>program.id===primaryProgramId&&program.category==='course');
  return selected?[selected,...programs.filter(program=>program.id!==selected.id)]:programs;
}
