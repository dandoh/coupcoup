import { Configuration } from "webpack";
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

const isProduction = process.env.NODE_ENV === "production";

const configuration: Configuration = {
  devServer: {
    historyApiFallback: true,
    port: 6789,
  },
  resolve: {
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
  },

  mode: isProduction ? "production" : "development",

  stats: isProduction ? undefined : "errors-warnings",

  entry: [path.join(__dirname, "src", "index.tsx")],

  output: {
    publicPath: "/",
    path: path.join(__dirname, "build"),
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
      inject: "body",
    }),
  ],

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
      },
    ],
  },
};

export default configuration;
