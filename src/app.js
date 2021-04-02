// 自定义 render
// export function render(oldRender) {
//     oldRender();
// }
export const dva = {
    config: {
        initialState: {
            //   global: {
            //     title: 'hello World'
            //   }
        },
        onError(err) {
            err.preventDefault();
            console.log(err);
        },
    },
};
