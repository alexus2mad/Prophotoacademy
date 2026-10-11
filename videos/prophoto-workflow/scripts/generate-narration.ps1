$ErrorActionPreference = 'Stop'
if (-not $env:ELEVENLABS_API_KEY) { throw 'ELEVENLABS_API_KEY is required' }
$project = Split-Path $PSScriptRoot -Parent
$script = Get-Content -Raw -Encoding utf8 -LiteralPath (Join-Path $project 'SCRIPT.md')
$lines = [regex]::Matches($script, '(?m)^    (.+)$')
$headers = @{ 'xi-api-key' = $env:ELEVENLABS_API_KEY }
$metadata = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
  $id = '{0:D2}' -f ($i + 1)
  $audioFile = Join-Path $project "assets/audio/voice-$id.mp3"
  $timingFile = Join-Path $project "assets/audio/voice-$id.alignment.json"
  if (-not (Test-Path -LiteralPath $audioFile)) {
    $payload = @{
      text = $lines[$i].Groups[1].Value
      model_id = 'eleven_v3'
      language_code = 'uk'
      voice_settings = @{ stability = 0.5; similarity_boost = 0.75; speed = 0.95 }
      seed = 22041
    } | ConvertTo-Json -Depth 4
    $response = Invoke-RestMethod -Method Post -Uri 'https://api.elevenlabs.io/v1/text-to-speech/GVRiwBELe0czFUAJj0nX/with-timestamps?output_format=mp3_44100_128' -Headers $headers -ContentType 'application/json' -Body ([Text.Encoding]::UTF8.GetBytes($payload)) -TimeoutSec 180
    [IO.File]::WriteAllBytes($audioFile, [Convert]::FromBase64String($response.audio_base64))
    $response.normalized_alignment | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 -LiteralPath $timingFile
  }
  $duration = [double](& ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $audioFile)
  $metadata += @{ id=$id; file="assets/audio/voice-$id.mp3"; duration=$duration; text=$lines[$i].Groups[1].Value; alignment="assets/audio/voice-$id.alignment.json" }
  Write-Output "Narration $id ready ($duration seconds)"
}
@{ provider='ElevenLabs'; model='eleven_v3'; voice='Anton'; voice_id='GVRiwBELe0czFUAJj0nX'; clips=$metadata } | ConvertTo-Json -Depth 6 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $project 'narration.json')
