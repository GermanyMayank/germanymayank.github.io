/* Produce seek-friendly video using FFmpeg; no npm dependencies required. */
import{spawnSync}from'node:child_process';
import{existsSync}from'node:fs';
import{mkdir,readFile,writeFile}from'node:fs/promises';
import{resolve,dirname,join}from'node:path';
import{fileURLToPath}from'node:url';

const args=process.argv.slice(2),value=flag=>{const i=args.indexOf(flag);return i<0?undefined:args[i+1]};
const input=value('--input');
if(!input){console.error('Usage: npm run media -- --input /absolute/path/clip.mp4 [--start 24 --end 28] [--interpolate]');process.exit(1)}
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const ffmpeg=process.env.FFMPEG_PATH||['C:/Program Files/Jellyfin/Server/ffmpeg.exe','/usr/bin/ffmpeg','/opt/homebrew/bin/ffmpeg'].find(existsSync)||'ffmpeg';
const ffprobe=process.env.FFPROBE_PATH||(ffmpeg.includes('/')||ffmpeg.includes('\\')?join(dirname(ffmpeg),process.platform==='win32'?'ffprobe.exe':'ffprobe'):'ffprobe');
const run=(exe,list)=>{const r=spawnSync(exe,list,{encoding:'utf8',windowsHide:true,maxBuffer:10*1024*1024});if(r.error||r.status!==0)throw new Error(r.error?.message||r.stderr);return r.stdout};
const source=resolve(input);if(!existsSync(source))throw Error('Input video not found: '+source);
const metadata=JSON.parse(run(ffprobe,['-v','error','-show_format','-show_streams','-of','json',source]));
const duration=Number(metadata.format.duration),stream=metadata.streams.find(s=>s.codec_type==='video');
if(!stream||!Number.isFinite(duration))throw Error('Input has no valid video stream');
const start=Number(value('--start')??0),end=Number(value('--end')??duration);
if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>duration+.05)throw Error('Invalid trim range');
await mkdir(resolve(root,'media'),{recursive:true});
const output=resolve(root,'media/solar-tour.mp4'),poster=resolve(root,'media/solar-poster.jpg');
const filters=["scale=w='min(1280,iw)':h=-2",args.includes('--interpolate')?'minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1':'fps=30'];
run(ffmpeg,['-hide_banner','-loglevel','warning','-y','-ss',String(start),'-i',source,'-t',String(end-start),'-map','0:v:0','-vf',filters.join(','),'-c:v','libx264','-preset','medium','-crf','20','-g','1','-keyint_min','1','-sc_threshold','0','-pix_fmt','yuv420p','-an','-sn','-dn','-map_metadata','-1','-movflags','+faststart',output]);
run(ffmpeg,['-hide_banner','-loglevel','warning','-y','-i',output,'-frames:v','1','-q:v','3',poster]);
const result=JSON.parse(run(ffprobe,['-v','error','-show_format','-of','json',output]));
const contentPath=resolve(root,'content/portfolio.json');
const content=JSON.parse(await readFile(contentPath,'utf8'));
content.tour.source='media/solar-tour.mp4';content.tour.poster='media/solar-poster.jpg';content.tour.start=0;content.tour.end=Number(result.format.duration);
await writeFile(contentPath,JSON.stringify(content,null,2)+'\n');
console.log(`Prepared ${content.tour.end.toFixed(2)}s, ${(Number(result.format.size)/1024/1024).toFixed(2)} MiB. Every frame is a seek point. Run npm run build next.`);
