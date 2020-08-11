import {Configuration} from "webpack"
import path from "path";

const configuration: Configuration = {
    devServer: {
        historyApiFallback: true,
        port: 6789,
    },
    entry: [
        path.join(__dirname, "src", "index.tsx")
    ],

    output: {
        publicPath: "/",
        path: path.join(__dirname, "build")
    },

    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: {
                                noEmit: false,
                            },
                        },
                    },
                ],
            }
        ]
    }

}


export default configuration
