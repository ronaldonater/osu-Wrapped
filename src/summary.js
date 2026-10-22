export const YEAR = 2026;
export const inYear = value => typeof value === 'string' && new Date(value).getUTCFullYear() === YEAR;
export function summarize(user, best, recent, mode) {
  const months = Array.from({length:12}, (_,i) => ({month:i,count:0,available:false}));
  for (const row of user.monthly_playcounts || []) if(inYear(row.start_date)) {
    const m = new Date(row.start_date).getUTCMonth(); months[m].count += row.count; months[m].available = true;
  }
  const unique = new Map();
  for(const score of [...best, ...recent]) if(inYear(score.ended_at || score.created_at)) unique.set(String(score.id),score);
  const scores = [...unique.values()];
  const passed = scores.filter(s=>s.passed !== false);
  const top = passed.filter(s=>Number.isFinite(s.pp)).sort((a,b)=>b.pp-a.pp).slice(0,25);
  const group = key => Object.entries(scores.reduce((all,s)=>{
    const name = s.beatmapset?.[key]; if(name) all[name]=(all[name]||0)+1; return all;
  },Object.create(null))).sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0])).slice(0,10).map(([name,count])=>({name,count}));
  return {year:YEAR,mode,generatedAt:new Date().toISOString(),user:{id:user.id,username:user.username,avatar:user.avatar_url,country:user.country_code,pp:user.statistics?.pp,rank:user.statistics?.global_rank},months,
    playcount:months.some(m=>m.available)?months.reduce((s,m)=>s+m.count,0):null,
    replayViews:Array.isArray(user.replays_watched_counts)?user.replays_watched_counts.filter(r=>inYear(r.start_date)).reduce((s,r)=>s+r.count,0):null,
    medals:Array.isArray(user.user_achievements)?user.user_achievements.filter(a=>inYear(a.achieved_at)).length:null,
    accuracy:passed.length?passed.reduce((s,p)=>s+p.accuracy*100,0)/passed.length:null,
    combo:passed.length?Math.max(...passed.map(s=>s.max_combo||0)):null,
    top:top.map(s=>({id:s.id,beatmapId:s.beatmap?.id,title:s.beatmapset?.title||'Unknown beatmap',artist:s.beatmapset?.artist||'Unknown artist',creator:s.beatmapset?.creator||'Unknown mapper',version:s.beatmap?.version||'',pp:s.pp,accuracy:s.accuracy*100,combo:s.max_combo,rank:s.rank,date:s.ended_at||s.created_at,mods:(s.mods||[]).map(m=>typeof m==='string'?m:m.acronym).join('')||'NM',cover:s.beatmapset?.covers?.['cover@2x']})),
    mappers:group('creator'),artists:group('artist'),sampleCount:scores.length,passedCount:passed.length,
    coverage:'Score statistics use deduplicated 2026 scores returned by current best and recent endpoints. This is a partial sample, not your complete year. Mapper credits use the beatmapset creator; guest difficulty creators may differ. Counts are observed scores, not all map attempts.'};
}
