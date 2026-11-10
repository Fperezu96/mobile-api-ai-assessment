import { test, type TestInfo, type TestStepInfo } from '@playwright/test';
export type ObservedStep = <T>(title: string, body: (step: TestStepInfo) => Promise<T>) => Promise<T>;
export function observedStep(info: TestInfo, capture: (step: TestStepInfo, error: unknown) => Promise<void>): ObservedStep {
  return async (title, body) => test.step(title, async step => {
    const previousErrors = info.errors.length;
    const record = async (error: unknown) => {
      try { await capture(step, error); }
      catch (captureError) { console.error('No se pudo adjuntar el diagnóstico del paso:', String(captureError)); }
    };
    try {
      const result = await body(step);
      if (info.errors.length > previousErrors) await record(info.errors.at(-1));
      return result;
    } catch (error) {
      await record(error);
      // Conservar el error original permite ver el diff y el stack de la aserción.
      throw error;
    }
  }, { box: true });
}
export function errorDetails(error: unknown) {
  if (error instanceof Error) return {message: error.message, stack: error.stack};
  return error;
}
