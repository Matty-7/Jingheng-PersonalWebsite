type BookDialogModule = typeof import('@/components/book_dialog');

let pending_module: Promise<BookDialogModule> | undefined;

export function load_book_dialog(): Promise<BookDialogModule> {
  pending_module ??= import('@/components/book_dialog').catch((error) => {
    pending_module = undefined;
    throw error;
  });
  return pending_module;
}
