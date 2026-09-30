# Keep all the detail when saving in "Editar treino"

Right now, saving in "Editar treino" can erase details the editor doesn't show: top sets, back-off sets, feeders, tempo, loads, extra notes, and the text of plans written freely.

## What changes
- Every exercise keeps its original details. The editor only changes the fields you edit (name, muscle, sets, reps, RPE, RIR, rest, notes). Everything else is saved as it was.
- Days keep their other information, and days with no exercises are not lost.
- Plans written as free text open read-only, with a warning: "Este treino está em texto livre — salvar vai convertê-lo." You can only save after confirming, and the original text is kept alongside so nothing is lost.

## Technical details
- `workoutEditorModel.ts`: add `raw` (original object) to EditableExercise/EditableDay; `exerciseFromRaw` stores the raw object and reads work_sets. `cleanExercise` starts from `raw` and overlays only the edited fields; when `structure.work_sets` existed, write sets/reps/rpe/rir/rest back there.
- Days: keep unknown keys via `raw`, and keep days with no exercises.
- Free text: `wasStructured=false` → the page shows the confirmation; the serializer adds `extra.original_text` with the original string.
- Tests: round-trip keeps top_set/backoff_sets/tempo/load, and free text keeps original_text.
