$ErrorActionPreference = 'Stop'
if (-not $env:ELEVENLABS_API_KEY) { throw 'ELEVENLABS_API_KEY is required' }
$project = Split-Path $PSScriptRoot -Parent
$description = 'A native Ukrainian woman around thirty, a charismatic creative director speaking to one person during a photo shoot. Contemporary standard Ukrainian pronunciation, no Russian accent. Warm rich mid-low register with a subtle grain, bright responsive upper inflections, precise consonants and natural breaths. Curious and alert, playful confidence, a smile audible in the payoff. Starts intimately but clearly, becomes energized by discovering the shot, lands with conviction. Lively varied timing and pitch, never monotonous, sleepy, syrupy, theatrical, or like a formal announcer. Clean close-microphone studio sound, no music.'
$text = 'Ще трохи ліворуч. Так. А тепер дочекайся. Ось він, твій кадр! За цими кількома секундами, знання. Практика. І люди, які допомогли тобі побачити більше. ПроФото. Вчися. Знімай. Створюй своє.'
$payload = @{model_id='eleven_ttv_v3';voice_description=$description;text=$text;seed=31011;loudness=0.4} | ConvertTo-Json
$response = Invoke-RestMethod -Method Post -Uri 'https://api.elevenlabs.io/v1/text-to-voice/design?output_format=mp3_44100_192' -Headers @{'xi-api-key'=$env:ELEVENLABS_API_KEY} -ContentType 'application/json' -Body ([Text.Encoding]::UTF8.GetBytes($payload)) -TimeoutSec 180
$metadata = @()
for ($i=0; $i -lt $response.previews.Count; $i++) {
  $preview = $response.previews[$i]
  $name = "voice-audition-$($i+1).mp3"
  [IO.File]::WriteAllBytes((Join-Path $project "assets/audio/$name"),[Convert]::FromBase64String($preview.audio_base_64))
  $metadata += @{file="assets/audio/$name";generated_voice_id=$preview.generated_voice_id;duration=$preview.duration_secs;language=$preview.language}
}
@{description=$description;text=$text;model='eleven_ttv_v3';previews=$metadata} | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $project 'voice-design.json')
$metadata | Select-Object file,duration,language | ConvertTo-Json
