# Seed Generator

Full control over seeds in your ComfyUI workflows. Choose between random, incremental, or manual mode, and use the built-in history to reuse seeds from previous runs.

![Seed Generator](LinuxTechLab_SeedGenerator/seed_generator.webp)

## Inputs

| Input       | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| Seed Widget | The seed control UI to manage seed, lock, step and history directly on the node. |
| Mode        | Operation mode selector.                                                         |
| History     | Seed history dropdown.                                                           |
| `seed_json` | Internal state, visible under **Advanced Inputs**. Do not edit manually.         |

## Outputs

| Output | Description                                                                 |
| ------ | --------------------------------------------------------------------------- |
| `seed` | The current seed value as an integer, ready to connect to any sampler node. |

## Controls

### Lock Button

Freezes the seed and overrides all modes. The seed stays fixed regardless of the selected mode. Useful when you have found a good seed and want to refine other parameters without changing it.

### Generate

Creates a new random seed immediately. Most useful in Manual mode, as in other modes the seed updates automatically after each run. Disabled when locked.

### Minus / Plus

Decrements or increments the seed by the selected **Step** value. Useful for exploring seeds in a controlled range. Disabled when locked.

### Trash

Clears the entire history.

### Step

Defines the step size for the **Minus** and **Plus** buttons and for the **Increment** and **Decrement** modes. Options: **1**, **10**, **100**, **1000**.

## Mode

Defines how the seed changes automatically after each workflow run.

| Mode          | Behavior                                                     |
| ------------- | ------------------------------------------------------------ |
| **Manual**    | Seed stays as set. Change it via the input field or buttons. |
| **Random**    | A new random seed is generated after every run.              |
| **Increment** | The seed increases by the Step value after every run.        |
| **Decrement** | The seed decreases by the Step value after every run.        |

> **Note:** The Lock button overrides all modes. A locked seed never changes regardless of the selected mode.

## History

Shows the last **50 seeds** from actual workflow runs. Seeds are only added when the workflow executes. Each entry shows the date and time.

Selecting an entry sets the current seed to that value.

## Tips

- Connect the `seed` output directly to the `noise_seed` or `seed` input of your sampler node.
- Use **Random** mode to get new results with every run.
- Use **Increment** mode to systematically explore a seed range across runs.
- Use **Lock** to keep a seed fixed while refining other parameters like prompt or sampler settings.
- Use **Manual** mode for full control over the seed.
