import retry from "async-retry";
import { response } from "express";

async function callWithRetry(fn) {
  return retry(
    async () => {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        response.send(error); 
      }
    },
    {
      retries: 3, // Số lần retry
      minTimeout: 1000, // Thời gian tối thiểu giữa các lần retry
      maxTimeout: 5000, // Thời gian tối đa giữa các lần retry
    }
  );
}

export { callWithRetry };
