/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SVG)
    window.SVG = {};

if (!window.SVG.Glyphs )
    window.SVG.Glyphs = {};

SVG.Glyphs = function () {
    
    var abc_glyphs = new ABCXJS.write.Glyphs();
    var cn_const_scale = '0.06';

    var glyphs = { // the @@ will be replaced by the abc_glyph contents.
       "cn.1": '<path id="cn.1" transform="scale('+cn_const_scale+')" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.022,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M150.026,80.39h-22.84c-6.91,0-10.933,7.044-10.933,13.158c0,5.936,3.209,13.158,10.933,13.158 h7.259v85.36c0,8.734,6.257,13.605,13.176,13.605s13.185-4.881,13.185-13.605V92.771C160.798,85.789,156.945,80.39,150.026,80.39z"/>'
      ,"cn.2": '<path id="cn.2" transform="scale('+cn_const_scale+')" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.022,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M173.232,180.205h-32.038 c15.661-18.459,40.852-39.753,40.852-63.736c0-21.91-16.564-35.882-39.216-35.882c-22.661,0-43.847,17.977-43.847,39.717 c0,6.731,4.604,12.586,13.445,12.586c17.691,0,8.108-28.498,29.294-28.498c7.554,0,13.266,6.204,13.266,13.284 c0,6.204-3.138,11.558-6.454,16.046c-13.999,18.969-30.581,34.496-45.867,51.579c-1.841,2.065-4.246,5.176-4.246,8.796 c0,7.938,6.266,11.38,14.365,11.38h61.528c6.999,0,13.266-4.568,13.266-12.497C187.58,185.05,181.331,180.205,173.232,180.205z"/>'
      ,"cn.23": '<path id="cn.23" transform="scale('+cn_const_scale+')" \nd="M 244.597 167.084 C 244.597 187.457 226.665 204.611 203.513 204.611 C 179.386 204.611 164.386 186.107 164.386 172.689 C 164.386 166.065 171.064 161.309 176.937 161.309 C 188.022 161.309 185.411 181.181 203.835 181.181 C 212.31 181.181 219.166 174.387 219.166 165.385 C 219.166 141.616 191.446 159.101 191.446 139.068 C 191.446 121.235 214.598 133.294 214.598 114.441 C 214.598 107.995 210.2 103.07 202.861 103.07 C 187.378 103.07 189.497 119.706 178.412 119.706 C 171.725 119.706 167.81 113.43 167.81 107.146 C 167.81 93.907 185.259 79.631 203.352 79.631 C 226.827 79.631 238.081 97.474 238.081 110.713 C 238.081 121.413 233.683 130.754 224.717 136.69 C 236.445 142.303 244.598 153.674 244.597 167.084 M 320.896 143.027 C 320.896 222.023 273.867 286.054 215.862 286.054 C 196.449 286.054 178.266 278.882 162.664 266.379 C 146.219 280.664 126.658 288.948 105.668 288.948 C 47.313 288.948 0 224.917 0 145.921 C 0 66.934 47.313 2.894 105.668 2.894 C 125.204 2.894 143.5 10.069 159.199 22.579 C 175.547 8.288 194.994 0 215.862 0 C 273.867 0 320.896 64.04 320.896 143.027 Z M 162.261 233.462 C 176.911 249.582 195.558 259.236 215.862 259.236 C 262.996 259.236 301.202 207.21 301.202 143.027 C 301.202 78.844 262.996 26.818 215.862 26.818 C 194.603 26.818 175.161 37.401 160.221 54.909 C 160.171 54.826 160.121 54.744 160.07 54.661 C 159.91 54.936 159.751 55.212 159.593 55.488 C 144.855 39.366 126.095 29.712 105.668 29.712 C 58.25 29.712 19.813 81.738 19.813 145.921 C 19.813 210.104 58.25 262.13 105.668 262.13 C 127.055 262.13 146.614 251.547 161.644 234.039 C 161.693 234.12 161.742 234.2 161.792 234.28 C 161.949 234.008 162.105 233.736 162.261 233.462 M 154.528 189.927 C 154.528 197.856 148.261 202.424 141.262 202.424 L 79.734 202.424 C 71.635 202.424 65.369 198.982 65.369 191.044 C 65.369 187.424 67.774 184.313 69.615 182.248 C 84.901 165.165 101.483 149.638 115.482 130.669 C 118.798 126.181 121.936 120.827 121.936 114.623 C 121.936 107.543 116.224 101.339 108.67 101.339 C 87.484 101.339 97.067 129.837 79.376 129.837 C 70.535 129.837 65.931 123.982 65.931 117.251 C 65.931 95.511 87.117 77.534 109.778 77.534 C 132.43 77.534 148.994 91.506 148.994 113.416 C 148.994 137.399 123.803 158.693 108.142 177.152 L 140.18 177.152 C 148.279 177.152 154.528 181.997 154.528 189.927 Z"/>'
      ,"cn.234": '<path id="cn.234" transform="scale('+cn_const_scale+')" \nd="M 259.702 172.031 C 259.702 192.404 241.77 209.558 218.618 209.558 C 194.491 209.558 179.491 191.054 179.491 177.636 C 179.491 171.012 186.169 166.256 192.042 166.256 C 203.127 166.256 200.516 186.128 218.94 186.128 C 227.415 186.128 234.271 179.334 234.271 170.332 C 234.271 146.563 206.551 164.048 206.551 144.015 C 206.551 126.182 229.703 138.241 229.703 119.388 C 229.703 112.942 225.305 108.017 217.966 108.017 C 202.483 108.017 204.602 124.653 193.517 124.653 C 186.83 124.653 182.915 118.377 182.915 112.093 C 182.915 98.854 200.364 84.578 218.457 84.578 C 241.932 84.578 253.186 102.421 253.186 115.66 C 253.186 126.36 248.788 135.701 239.822 141.637 C 251.55 147.25 259.703 158.621 259.702 172.031 M 168.58 194.874 C 168.58 202.803 162.313 207.371 155.314 207.371 L 93.786 207.371 C 85.687 207.371 79.421 203.929 79.421 195.991 C 79.421 192.371 81.826 189.26 83.667 187.195 C 98.953 170.112 115.535 154.585 129.534 135.616 C 132.85 131.128 135.988 125.774 135.988 119.57 C 135.988 112.49 130.276 106.286 122.722 106.286 C 101.536 106.286 111.119 134.784 93.428 134.784 C 84.587 134.784 79.983 128.929 79.983 122.198 C 79.983 100.458 101.169 82.481 123.83 82.481 C 146.482 82.481 163.046 96.453 163.046 118.363 C 163.046 142.346 137.855 163.64 122.194 182.099 L 154.232 182.099 C 162.331 182.099 168.58 186.944 168.58 194.874 M 143.027 288.948 C 64.04 288.948 0 224.917 0 145.921 C 0 66.934 64.04 2.894 143.027 2.894 C 169.792 2.894 194.84 10.246 216.261 23.04 C 238.668 8.467 265.412 0 294.132 0 C 373.119 0 437.159 64.04 437.159 143.027 C 437.159 222.023 373.119 286.054 294.132 286.054 C 267.369 286.054 242.322 278.703 220.9 265.909 C 198.492 280.482 171.748 288.948 143.027 288.948 Z M 216.017 55.488 C 196.068 39.366 170.675 29.712 143.027 29.712 C 78.844 29.712 26.818 81.738 26.818 145.921 C 26.818 210.104 78.844 262.13 143.027 262.13 C 171.975 262.13 198.449 251.547 218.793 234.039 C 219.116 234.43 219.441 234.82 219.768 235.208 C 220.231 234.629 220.689 234.047 221.143 233.462 C 241.093 249.582 266.484 259.236 294.132 259.236 C 358.315 259.236 410.341 207.21 410.341 143.027 C 410.341 78.844 358.315 26.818 294.132 26.818 C 265.184 26.818 238.71 37.401 218.366 54.909 C 218.043 54.518 217.719 54.129 217.392 53.742 C 216.929 54.321 216.471 54.902 216.017 55.488 M 354.44 159.87 L 349.398 159.87 L 349.398 107.263 C 349.398 91.673 341.004 85.326 330.465 85.326 C 321.016 85.326 315.93 88.419 311.934 95.266 L 271.234 164.831 C 270.143 166.538 268.686 168.603 268.686 172.376 C 268.686 176.828 272.503 182.486 281.406 182.486 L 325.199 182.486 L 325.199 197.048 C 325.199 206.139 327.049 210.412 336.319 210.412 C 345.589 210.412 349.397 206.13 349.397 197.048 L 349.397 182.486 L 354.439 182.486 C 361.528 182.486 367.159 178.034 367.159 171.169 C 367.16 164.321 361.529 159.87 354.44 159.87 Z M 325.754 159.87 L 300.858 159.87 L 325.387 112.054 L 325.754 112.054 L 325.754 159.87 Z"/>'
      ,"cn.2345": '<path id="cn.2345" transform="scale('+cn_const_scale+')" \nd="M 208.702 167.302 C 208.702 187.675 190.77 204.829 167.618 204.829 C 143.491 204.829 128.491 186.325 128.491 172.907 C 128.491 166.283 135.169 161.527 141.042 161.527 C 152.127 161.527 149.516 181.399 167.94 181.399 C 176.415 181.399 183.271 174.605 183.271 165.603 C 183.271 141.834 155.551 159.319 155.551 139.286 C 155.551 121.453 178.703 133.512 178.703 114.659 C 178.703 108.213 174.305 103.288 166.966 103.288 C 151.483 103.288 153.602 119.924 142.517 119.924 C 135.83 119.924 131.915 113.648 131.915 107.364 C 131.915 94.125 149.364 79.849 167.457 79.849 C 190.932 79.849 202.186 97.692 202.186 110.931 C 202.186 121.631 197.788 130.972 188.822 136.908 C 200.55 142.521 208.703 153.892 208.702 167.302 M 444.58 144.08 C 444.58 223.076 375.277 286.054 296.29 286.054 C 269.744 286.054 244.886 278.821 223.58 266.219 C 201.27 280.602 174.701 288.948 146.185 288.948 C 67.198 288.948 0 224.917 0 145.921 C 0 66.934 67.198 2.894 146.185 2.894 C 172.733 2.894 197.592 10.127 218.897 22.73 C 241.207 8.347 267.775 0 296.29 0 C 375.277 0 444.58 65.093 444.58 144.08 Z M 223.301 233.462 C 243.251 249.582 268.642 259.236 296.29 259.236 C 360.473 259.236 417.762 208.263 417.762 144.08 C 417.762 79.897 360.473 26.818 296.29 26.818 C 267.342 26.818 240.868 37.401 220.524 54.909 C 220.371 54.724 220.217 54.539 220.063 54.354 C 219.765 54.73 219.469 55.108 219.175 55.488 C 199.226 39.366 173.833 29.712 146.185 29.712 C 82.002 29.712 26.818 81.738 26.818 145.921 C 26.818 210.104 82.002 262.13 146.185 262.13 C 175.133 262.13 201.607 251.547 221.951 234.039 C 222.105 234.225 222.259 234.411 222.413 234.596 C 222.711 234.219 223.007 233.841 223.301 233.462 M 296.44 153.141 L 291.398 153.141 L 291.398 100.534 C 291.398 84.944 283.004 78.597 272.465 78.597 C 263.016 78.597 257.93 81.69 253.934 88.537 L 213.234 158.102 C 212.143 159.809 210.686 161.874 210.686 165.647 C 210.686 170.099 214.503 175.757 223.406 175.757 L 267.199 175.757 L 267.199 190.319 C 267.199 199.41 269.049 203.683 278.319 203.683 C 287.589 203.683 291.397 199.401 291.397 190.319 L 291.397 175.757 L 296.439 175.757 C 303.528 175.757 309.159 171.305 309.159 164.44 C 309.16 157.592 303.529 153.141 296.44 153.141 Z M 267.754 153.141 L 242.858 153.141 L 267.387 105.325 L 267.754 105.325 L 267.754 153.141 M 395.591 156.989 C 395.591 185.862 378.633 204.885 346.774 204.885 C 333.696 204.885 306.253 196.929 306.253 181.715 C 306.253 175.324 311.956 169.96 318.768 169.96 C 326.134 169.96 334.984 181.018 347.329 181.018 C 360.219 181.018 366.852 169.272 366.852 158.375 C 366.852 147.997 360.585 140.917 349.161 140.917 C 338.47 140.917 336.816 146.62 327.421 146.62 C 320.243 146.62 316.56 141.435 316.56 138.494 C 316.56 136.25 316.926 134.516 317.114 132.621 L 321.718 96.14 C 323.371 82.651 327.251 79.71 336.083 79.71 L 380.484 79.71 C 388.95 79.71 393.929 84.376 393.929 90.598 C 393.929 102.532 384.355 103.569 381.039 103.569 L 346.409 103.569 L 343.647 121.894 C 348.063 121.045 352.845 120.178 357.458 120.178 C 379.752 120.178 395.592 136.769 395.591 156.989 M 130.344 188.824 C 130.344 196.753 124.077 201.321 117.078 201.321 L 55.55 201.321 C 47.451 201.321 41.185 197.879 41.185 189.941 C 41.185 186.321 43.59 183.21 45.431 181.145 C 60.717 164.062 77.299 148.535 91.298 129.566 C 94.614 125.078 97.752 119.724 97.752 113.52 C 97.752 106.44 92.04 100.236 84.486 100.236 C 63.3 100.236 72.883 128.734 55.192 128.734 C 46.351 128.734 41.747 122.879 41.747 116.148 C 41.747 94.408 62.933 76.431 85.594 76.431 C 108.246 76.431 124.81 90.403 124.81 112.313 C 124.81 136.296 99.619 157.59 83.958 176.049 L 115.996 176.049 C 124.095 176.049 130.344 180.894 130.344 188.824 Z"/>'
      ,"cn.24": '<path id="cn.24" transform="scale('+cn_const_scale+')" \nd="M 320.896 143.027 C 320.896 222.023 273.867 286.054 215.862 286.054 C 196.449 286.054 178.266 278.882 162.664 266.379 C 146.219 280.664 126.658 288.948 105.668 288.948 C 47.313 288.948 0 224.917 0 145.921 C 0 66.934 47.313 2.894 105.668 2.894 C 125.204 2.894 143.5 10.069 159.199 22.579 C 175.547 8.288 194.994 0 215.862 0 C 273.867 0 320.896 64.04 320.896 143.027 Z M 162.261 233.462 C 176.911 249.582 195.558 259.236 215.862 259.236 C 262.996 259.236 301.202 207.21 301.202 143.027 C 301.202 78.844 262.996 26.818 215.862 26.818 C 194.603 26.818 175.161 37.401 160.221 54.909 C 160.171 54.826 160.121 54.744 160.07 54.661 C 159.91 54.936 159.751 55.212 159.593 55.488 C 144.855 39.366 126.095 29.712 105.668 29.712 C 58.25 29.712 19.813 81.738 19.813 145.921 C 19.813 210.104 58.25 262.13 105.668 262.13 C 127.055 262.13 146.614 251.547 161.644 234.039 C 161.693 234.12 161.742 234.2 161.792 234.28 C 161.949 234.008 162.105 233.736 162.261 233.462 M 156.87 187.139 C 156.87 195.068 150.603 199.636 143.604 199.636 L 82.076 199.636 C 73.977 199.636 67.711 196.194 67.711 188.256 C 67.711 184.636 70.116 181.525 71.957 179.46 C 87.243 162.377 103.825 146.85 117.824 127.881 C 121.14 123.393 124.278 118.039 124.278 111.835 C 124.278 104.755 118.566 98.551 111.012 98.551 C 89.826 98.551 99.409 127.049 81.718 127.049 C 72.877 127.049 68.273 121.194 68.273 114.463 C 68.273 92.723 89.459 74.746 112.12 74.746 C 134.772 74.746 151.336 88.718 151.336 110.628 C 151.336 134.611 126.145 155.905 110.484 174.364 L 142.522 174.364 C 150.621 174.364 156.87 179.209 156.87 187.139 M 242.361 149.977 L 237.319 149.977 L 237.319 97.37 C 237.319 81.78 228.925 75.433 218.386 75.433 C 208.937 75.433 203.851 78.526 199.855 85.373 L 159.155 154.938 C 158.064 156.645 156.607 158.71 156.607 162.483 C 156.607 166.935 160.424 172.593 169.327 172.593 L 213.12 172.593 L 213.12 187.155 C 213.12 196.246 214.97 200.519 224.24 200.519 C 233.51 200.519 237.318 196.237 237.318 187.155 L 237.318 172.593 L 242.36 172.593 C 249.449 172.593 255.08 168.141 255.08 161.276 C 255.081 154.428 249.45 149.977 242.361 149.977 Z M 213.675 149.977 L 188.779 149.977 L 213.308 102.161 L 213.675 102.161 L 213.675 149.977 Z"/>'
      ,"cn.25": '<path id="cn.25" transform="scale('+cn_const_scale+')" \nd="M 320.896 143.027 C 320.896 222.023 273.867 286.054 215.862 286.054 C 196.449 286.054 178.266 278.882 162.664 266.379 C 146.219 280.664 126.658 288.948 105.668 288.948 C 47.313 288.948 0 224.917 0 145.921 C 0 66.934 47.313 2.894 105.668 2.894 C 125.204 2.894 143.5 10.069 159.199 22.579 C 175.547 8.288 194.994 0 215.862 0 C 273.867 0 320.896 64.04 320.896 143.027 Z M 162.261 233.462 C 176.911 249.582 195.558 259.236 215.862 259.236 C 262.996 259.236 301.202 207.21 301.202 143.027 C 301.202 78.844 262.996 26.818 215.862 26.818 C 194.603 26.818 175.161 37.401 160.221 54.909 C 160.171 54.826 160.121 54.744 160.07 54.661 C 159.91 54.936 159.751 55.212 159.593 55.488 C 144.855 39.366 126.095 29.712 105.668 29.712 C 58.25 29.712 19.813 81.738 19.813 145.921 C 19.813 210.104 58.25 262.13 105.668 262.13 C 127.055 262.13 146.614 251.547 161.644 234.039 C 161.693 234.12 161.742 234.2 161.792 234.28 C 161.949 234.008 162.105 233.736 162.261 233.462 M 154.049 186.195 C 154.049 194.124 147.782 198.692 140.783 198.692 L 79.255 198.692 C 71.156 198.692 64.89 195.25 64.89 187.312 C 64.89 183.692 67.295 180.581 69.136 178.516 C 84.422 161.433 101.004 145.906 115.003 126.937 C 118.319 122.449 121.457 117.095 121.457 110.891 C 121.457 103.811 115.745 97.607 108.191 97.607 C 87.005 97.607 96.588 126.105 78.897 126.105 C 70.056 126.105 65.452 120.25 65.452 113.519 C 65.452 91.779 86.638 73.802 109.299 73.802 C 131.951 73.802 148.515 87.774 148.515 109.684 C 148.515 133.667 123.324 154.961 107.663 173.42 L 139.701 173.42 C 147.8 173.42 154.049 178.265 154.049 186.195 M 253.691 159.249 C 253.691 188.122 236.733 207.145 204.874 207.145 C 191.796 207.145 164.353 199.189 164.353 183.975 C 164.353 177.584 170.056 172.22 176.868 172.22 C 184.234 172.22 193.084 183.278 205.429 183.278 C 218.319 183.278 224.952 171.532 224.952 160.635 C 224.952 150.257 218.685 143.177 207.261 143.177 C 196.57 143.177 194.916 148.88 185.521 148.88 C 178.343 148.88 174.66 143.695 174.66 140.754 C 174.66 138.51 175.026 136.776 175.214 134.881 L 179.818 98.4 C 181.471 84.911 185.351 81.97 194.183 81.97 L 238.584 81.97 C 247.05 81.97 252.029 86.636 252.029 92.858 C 252.029 104.792 242.455 105.829 239.139 105.829 L 204.509 105.829 L 201.747 124.154 C 206.163 123.305 210.945 122.438 215.558 122.438 C 237.852 122.438 253.692 139.029 253.691 159.249 Z"/>'
      ,"cn.3": '<path id="cn.3" transform="scale('+cn_const_scale+')" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.014,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M167.717,137.637 c8.966-5.936,13.364-15.277,13.364-25.977c0-13.239-11.254-31.082-34.729-31.082c-18.093,0-35.542,14.276-35.542,27.515 c0,6.284,3.915,12.56,10.602,12.56c11.085,0,8.966-16.636,24.449-16.636c7.339,0,11.737,4.925,11.737,11.371 c0,18.853-23.152,6.794-23.152,24.627c0,20.033,27.72,2.548,27.72,26.317c0,9.002-6.856,15.796-15.331,15.796 c-18.424,0-15.813-19.872-26.898-19.872c-5.873,0-12.551,4.756-12.551,11.38c0,13.418,15,31.922,39.127,31.922 c23.152,0,41.084-17.154,41.084-37.527C187.598,154.621,179.445,143.25,167.717,137.637z"/>'
      ,"cn.34": '<path id="cn.34" transform="scale('+cn_const_scale+')" \nd="M 320.896 143.027 C 320.896 222.023 273.867 286.054 215.862 286.054 C 196.449 286.054 178.266 278.882 162.664 266.379 C 146.219 280.664 126.658 288.948 105.668 288.948 C 47.313 288.948 0 224.917 0 145.921 C 0 66.934 47.313 2.894 105.668 2.894 C 125.204 2.894 143.5 10.069 159.199 22.579 C 175.547 8.288 194.994 0 215.862 0 C 273.867 0 320.896 64.04 320.896 143.027 Z M 162.261 233.462 C 176.911 249.582 195.558 259.236 215.862 259.236 C 262.996 259.236 301.202 207.21 301.202 143.027 C 301.202 78.844 262.996 26.818 215.862 26.818 C 194.603 26.818 175.161 37.401 160.221 54.909 C 160.171 54.826 160.121 54.744 160.07 54.661 C 159.91 54.936 159.751 55.212 159.593 55.488 C 144.855 39.366 126.095 29.712 105.668 29.712 C 58.25 29.712 19.813 81.738 19.813 145.921 C 19.813 210.104 58.25 262.13 105.668 262.13 C 127.055 262.13 146.614 251.547 161.644 234.039 C 161.693 234.12 161.742 234.2 161.792 234.28 C 161.949 234.008 162.105 233.736 162.261 233.462 M 146.304 166.911 C 146.304 187.284 128.372 204.438 105.22 204.438 C 81.093 204.438 66.093 185.934 66.093 172.516 C 66.093 165.892 72.771 161.136 78.644 161.136 C 89.729 161.136 87.118 181.008 105.542 181.008 C 114.017 181.008 120.873 174.214 120.873 165.212 C 120.873 141.443 93.153 158.928 93.153 138.895 C 93.153 121.062 116.305 133.121 116.305 114.268 C 116.305 107.822 111.907 102.897 104.568 102.897 C 89.085 102.897 91.204 119.533 80.119 119.533 C 73.432 119.533 69.517 113.257 69.517 106.973 C 69.517 93.734 86.966 79.458 105.059 79.458 C 128.534 79.458 139.788 97.301 139.788 110.54 C 139.788 121.24 135.39 130.581 126.424 136.517 C 138.152 142.13 146.305 153.501 146.304 166.911 M 244.084 155.896 L 239.042 155.896 L 239.042 103.289 C 239.042 87.699 230.648 81.352 220.109 81.352 C 210.66 81.352 205.574 84.445 201.578 91.292 L 160.878 160.857 C 159.787 162.564 158.33 164.629 158.33 168.402 C 158.33 172.854 162.147 178.512 171.05 178.512 L 214.843 178.512 L 214.843 193.074 C 214.843 202.165 216.693 206.438 225.963 206.438 C 235.233 206.438 239.041 202.156 239.041 193.074 L 239.041 178.512 L 244.083 178.512 C 251.172 178.512 256.803 174.06 256.803 167.195 C 256.804 160.347 251.173 155.896 244.084 155.896 Z M 215.398 155.896 L 190.502 155.896 L 215.031 108.08 L 215.398 108.08 L 215.398 155.896 Z"/>'
      ,"cn.345": '<path id="cn.345" transform="scale('+cn_const_scale+')" \nd="M 158.702 167.031 C 158.702 187.404 140.77 204.558 117.618 204.558 C 93.491 204.558 78.491 186.054 78.491 172.636 C 78.491 166.012 85.169 161.256 91.042 161.256 C 102.127 161.256 99.516 181.128 117.94 181.128 C 126.415 181.128 133.271 174.334 133.271 165.332 C 133.271 141.563 105.551 159.048 105.551 139.015 C 105.551 121.182 128.703 133.241 128.703 114.388 C 128.703 107.942 124.305 103.017 116.966 103.017 C 101.483 103.017 103.602 119.653 92.517 119.653 C 85.83 119.653 81.915 113.377 81.915 107.093 C 81.915 93.854 99.364 79.578 117.457 79.578 C 140.932 79.578 152.186 97.421 152.186 110.66 C 152.186 121.36 147.788 130.701 138.822 136.637 C 150.55 142.25 158.703 153.621 158.702 167.031 M 436.159 143.027 C 436.159 222.023 372.119 286.054 293.132 286.054 C 266.586 286.054 241.728 278.821 220.422 266.219 C 198.112 280.602 171.543 288.948 143.027 288.948 C 64.04 288.948 0 224.917 0 145.921 C 0 66.934 64.04 2.894 143.027 2.894 C 169.575 2.894 194.434 10.127 215.739 22.73 C 238.049 8.347 264.617 0 293.132 0 C 372.119 0 436.159 64.04 436.159 143.027 Z M 220.143 233.462 C 240.093 249.582 265.484 259.236 293.132 259.236 C 357.315 259.236 409.341 207.21 409.341 143.027 C 409.341 78.844 357.315 26.818 293.132 26.818 C 264.184 26.818 237.71 37.401 217.366 54.909 C 217.213 54.724 217.059 54.539 216.905 54.354 C 216.607 54.73 216.311 55.108 216.017 55.488 C 196.068 39.366 170.675 29.712 143.027 29.712 C 78.844 29.712 26.818 81.738 26.818 145.921 C 26.818 210.104 78.844 262.13 143.027 262.13 C 171.975 262.13 198.449 251.547 218.793 234.039 C 218.947 234.225 219.101 234.411 219.255 234.596 C 219.553 234.219 219.849 233.841 220.143 233.462 M 250.44 152.87 L 245.398 152.87 L 245.398 100.263 C 245.398 84.673 237.004 78.326 226.465 78.326 C 217.016 78.326 211.93 81.419 207.934 88.266 L 167.234 157.831 C 166.143 159.538 164.686 161.603 164.686 165.376 C 164.686 169.828 168.503 175.486 177.406 175.486 L 221.199 175.486 L 221.199 190.048 C 221.199 199.139 223.049 203.412 232.319 203.412 C 241.589 203.412 245.397 199.13 245.397 190.048 L 245.397 175.486 L 250.439 175.486 C 257.528 175.486 263.159 171.034 263.159 164.169 C 263.16 157.321 257.529 152.87 250.44 152.87 Z M 221.754 152.87 L 196.858 152.87 L 221.387 105.054 L 221.754 105.054 L 221.754 152.87 M 362.591 156.718 C 362.591 185.591 345.633 204.614 313.774 204.614 C 300.696 204.614 273.253 196.658 273.253 181.444 C 273.253 175.053 278.956 169.689 285.768 169.689 C 293.134 169.689 301.984 180.747 314.329 180.747 C 327.219 180.747 333.852 169.001 333.852 158.104 C 333.852 147.726 327.585 140.646 316.161 140.646 C 305.47 140.646 303.816 146.349 294.421 146.349 C 287.243 146.349 283.56 141.164 283.56 138.223 C 283.56 135.979 283.926 134.245 284.114 132.35 L 288.718 95.869 C 290.371 82.38 294.251 79.439 303.083 79.439 L 347.484 79.439 C 355.95 79.439 360.929 84.105 360.929 90.327 C 360.929 102.261 351.355 103.298 348.039 103.298 L 313.409 103.298 L 310.647 121.623 C 315.063 120.774 319.845 119.907 324.458 119.907 C 346.752 119.907 362.592 136.498 362.591 156.718 Z"/>'
      ,"cn.35": '<path id="cn.35" transform="scale('+cn_const_scale+')" \nd="M 320.896 143.027 C 320.896 222.023 273.867 286.054 215.862 286.054 C 196.449 286.054 178.266 278.882 162.664 266.379 C 146.219 280.664 126.658 288.948 105.668 288.948 C 47.313 288.948 0 224.917 0 145.921 C 0 66.934 47.313 2.894 105.668 2.894 C 125.204 2.894 143.5 10.069 159.199 22.579 C 175.547 8.288 194.994 0 215.862 0 C 273.867 0 320.896 64.04 320.896 143.027 Z M 162.261 233.462 C 176.911 249.582 195.558 259.236 215.862 259.236 C 262.996 259.236 301.202 207.21 301.202 143.027 C 301.202 78.844 262.996 26.818 215.862 26.818 C 194.603 26.818 175.161 37.401 160.221 54.909 C 160.171 54.826 160.121 54.744 160.07 54.661 C 159.91 54.936 159.751 55.212 159.593 55.488 C 144.855 39.366 126.095 29.712 105.668 29.712 C 58.25 29.712 19.813 81.738 19.813 145.921 C 19.813 210.104 58.25 262.13 105.668 262.13 C 127.055 262.13 146.614 251.547 161.644 234.039 C 161.693 234.12 161.742 234.2 161.792 234.28 C 161.949 234.008 162.105 233.736 162.261 233.462 M 250.888 154.38 C 250.888 183.253 233.93 202.276 202.071 202.276 C 188.993 202.276 161.55 194.32 161.55 179.106 C 161.55 172.715 167.253 167.351 174.065 167.351 C 181.431 167.351 190.281 178.409 202.626 178.409 C 215.516 178.409 222.149 166.663 222.149 155.766 C 222.149 145.388 215.882 138.308 204.458 138.308 C 193.767 138.308 192.113 144.011 182.718 144.011 C 175.54 144.011 171.857 138.826 171.857 135.885 C 171.857 133.641 172.223 131.907 172.411 130.012 L 177.015 93.531 C 178.668 80.042 182.548 77.101 191.38 77.101 L 235.781 77.101 C 244.247 77.101 249.226 81.767 249.226 87.989 C 249.226 99.923 239.652 100.96 236.336 100.96 L 201.706 100.96 L 198.944 119.285 C 203.36 118.436 208.142 117.569 212.755 117.569 C 235.049 117.569 250.889 134.16 250.888 154.38 M 149.904 161.495 C 149.904 181.868 131.972 199.022 108.82 199.022 C 84.693 199.022 69.693 180.518 69.693 167.1 C 69.693 160.476 76.371 155.72 82.244 155.72 C 93.329 155.72 90.718 175.592 109.142 175.592 C 117.617 175.592 124.473 168.798 124.473 159.796 C 124.473 136.027 96.753 153.512 96.753 133.479 C 96.753 115.646 119.905 127.705 119.905 108.852 C 119.905 102.406 115.507 97.481 108.168 97.481 C 92.685 97.481 94.804 114.117 83.719 114.117 C 77.032 114.117 73.117 107.841 73.117 101.557 C 73.117 88.318 90.566 74.042 108.659 74.042 C 132.134 74.042 143.388 91.885 143.388 105.124 C 143.388 115.824 138.99 125.165 130.024 131.101 C 141.752 136.714 149.905 148.085 149.904 161.495 Z"/>'
      ,"cn.4": '<path id="cn.4" transform="scale('+cn_const_scale+')" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.014,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M175.065,155.122h-5.042v-52.607 c0-15.59-8.394-21.937-18.933-21.937c-9.449,0-14.535,3.093-18.531,9.94l-40.7,69.565c-1.091,1.707-2.548,3.772-2.548,7.545 c0,4.452,3.817,10.11,12.72,10.11h43.793V192.3c0,9.091,1.85,13.364,11.12,13.364s13.078-4.282,13.078-13.364v-14.562h5.042 c7.089,0,12.72-4.452,12.72-11.317C187.785,159.573,182.154,155.122,175.065,155.122z M146.379,155.122h-24.896l24.529-47.816 h0.367V155.122z"/>'
      ,"cn.45": '<path id="cn.45" transform="scale('+cn_const_scale+')" \nd="M 320.896 143.027 C 320.896 222.023 273.867 286.054 215.862 286.054 C 196.449 286.054 178.266 278.882 162.664 266.379 C 146.219 280.664 126.658 288.948 105.668 288.948 C 47.313 288.948 0 224.917 0 145.921 C 0 66.934 47.313 2.894 105.668 2.894 C 125.204 2.894 143.5 10.069 159.199 22.579 C 175.547 8.288 194.994 0 215.862 0 C 273.867 0 320.896 64.04 320.896 143.027 Z M 162.261 233.462 C 176.911 249.582 195.558 259.236 215.862 259.236 C 262.996 259.236 301.202 207.21 301.202 143.027 C 301.202 78.844 262.996 26.818 215.862 26.818 C 194.603 26.818 175.161 37.401 160.221 54.909 C 160.171 54.826 160.121 54.744 160.07 54.661 C 159.91 54.936 159.751 55.212 159.593 55.488 C 144.855 39.366 126.095 29.712 105.668 29.712 C 58.25 29.712 19.813 81.738 19.813 145.921 C 19.813 210.104 58.25 262.13 105.668 262.13 C 127.055 262.13 146.614 251.547 161.644 234.039 C 161.693 234.12 161.742 234.2 161.792 234.28 C 161.949 234.008 162.105 233.736 162.261 233.462 M 147.276 152.9 L 142.234 152.9 L 142.234 100.293 C 142.234 84.703 133.84 78.356 123.301 78.356 C 113.852 78.356 108.766 81.449 104.77 88.296 L 64.07 157.861 C 62.979 159.568 61.522 161.633 61.522 165.406 C 61.522 169.858 65.339 175.516 74.242 175.516 L 118.035 175.516 L 118.035 190.078 C 118.035 199.169 119.885 203.442 129.155 203.442 C 138.425 203.442 142.233 199.16 142.233 190.078 L 142.233 175.516 L 147.275 175.516 C 154.364 175.516 159.995 171.064 159.995 164.199 C 159.996 157.351 154.365 152.9 147.276 152.9 Z M 118.59 152.9 L 93.694 152.9 L 118.223 105.084 L 118.59 105.084 L 118.59 152.9 M 256.743 156.906 C 256.743 185.779 239.785 204.802 207.926 204.802 C 194.848 204.802 167.405 196.846 167.405 181.632 C 167.405 175.241 173.108 169.877 179.92 169.877 C 187.286 169.877 196.136 180.935 208.481 180.935 C 221.371 180.935 228.004 169.189 228.004 158.292 C 228.004 147.914 221.737 140.834 210.313 140.834 C 199.622 140.834 197.968 146.537 188.573 146.537 C 181.395 146.537 177.712 141.352 177.712 138.411 C 177.712 136.167 178.078 134.433 178.266 132.538 L 182.87 96.057 C 184.523 82.568 188.403 79.627 197.235 79.627 L 241.636 79.627 C 250.102 79.627 255.081 84.293 255.081 90.515 C 255.081 102.449 245.507 103.486 242.191 103.486 L 207.561 103.486 L 204.799 121.811 C 209.215 120.962 213.997 120.095 218.61 120.095 C 240.904 120.095 256.744 136.686 256.743 156.906 Z"/>'
      ,"cn.5": '<path id="cn.5" transform="scale('+cn_const_scale+')" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.014,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M149.678,120.849 c-4.613,0-9.395,0.867-13.811,1.716l2.762-18.325h34.63c3.316,0,12.89-1.037,12.89-12.971c0-6.222-4.979-10.888-13.445-10.888 h-44.401c-8.832,0-12.712,2.941-14.365,16.43l-4.604,36.481c-0.188,1.895-0.554,3.629-0.554,5.873 c0,2.941,3.683,8.126,10.861,8.126c9.395,0,11.049-5.703,21.74-5.703c11.424,0,17.691,7.08,17.691,17.458 c0,10.897-6.633,22.643-19.523,22.643c-12.345,0-21.195-11.058-28.561-11.058c-6.812,0-12.515,5.364-12.515,11.755 c0,15.214,27.443,23.17,40.521,23.17c31.859,0,48.817-19.023,48.817-47.896C187.812,137.44,171.972,120.849,149.678,120.849z"/>'
      ,"n.0": '<path id="n.0" transform="scale(0.95)" \nd="@@"/>'
      ,"n.1": '<path id="n.1" transform="scale(0.95)" \nd="@@"/>'
      ,"n.2": '<path id="n.2" transform="scale(0.95)" \nd="@@"/>'
      ,"n.3": '<path id="n.3" transform="scale(0.95)" \nd="@@"/>'
      ,"n.4": '<path id="n.4" transform="scale(0.95)" \nd="@@"/>'
      ,"n.5": '<path id="n.5" transform="scale(0.95)" \nd="@@"/>'
      ,"n.6": '<path id="n.6" transform="scale(0.95)" \nd="@@"/>'
      ,"n.7": '<path id="n.7" transform="scale(0.95)" \nd="@@"/>'
      ,"n.8": '<path id="n.8" transform="scale(0.95)" \nd="@@"/>'
      ,"n.9": '<path id="n.9" transform="scale(0.95)" \nd="@@"/>'
      ,"f": '<path id="n.f" transform="scale(0.95)" \nd="@@"/>'
      ,"m": '<path id="n.m" transform="scale(0.95)" \nd="@@"/>'
      ,"p": '<path id="n.p" transform="scale(0.95)" \nd="@@"/>'
      ,"r": '<path id="n.r" transform="scale(0.95)" \nd="@@"/>'
      ,"s": '<path id="n.s" transform="scale(0.95)" \nd="@@"/>'
      ,"z": '<path id="n.z" transform="scale(0.95)" \nd="@@"/>'
      ,"+": '<path id="+" transform="scale(0.95)" \nd="@@"/>'
      ,",": '<path id="," transform="scale(0.95)" \nd="@@"/>'
      ,"-": '<path id="-" transform="scale(0.95)" \nd="@@"/>'
      ,".": '<path id="." transform="scale(0.95)" \nd="@@"/>'
      ,"accidentals.nat": '<path id="accidentals.nat" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.sharp": '<path id="accidentals.sharp" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.flat": '<path id="accidentals.flat" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.halfsharp": '<path id="accidentals.halfsharp" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.dblsharp": '<path id="accidentals.dblsharp" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.halfflat": '<path id="accidentals.halfflat" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.dblflat": '<path id="accidentals.dblflat" transform="scale(0.8)" \nd="@@"/>'
      ,"clefs.C": '<path id="clefs.C" \nd="@@"/>'
      ,"clefs.F": '<path id="clefs.F" \nd="@@"/>'
      ,"clefs.G": '<path id="clefs.G" \nd="@@"/>'
      ,"clefs.perc": '<path id="clefs.perc" \nd="@@"/>'
      ,"clefs.tab": '<path id="clefs.tab" transform="scale(0.9)" \nd="@@"/>'
      ,"dots.dot": '<path id="dots.dot" \nd="@@"/>'
      ,"flags.d8th": '<path id="flags.d8th" \nd="@@"/>'
      ,"flags.d16th": '<path id="flags.d16th" \nd="@@"/>'
      ,"flags.d32nd": '<path id="flags.d32nd" \nd="@@"/>'
      ,"flags.d64th": '<path id="flags.d64th" \nd="@@"/>'
      ,"flags.dgrace": '<path id="flags.dgrace" \nd="@@"/>'
      ,"flags.u8th": '<path id="flags.u8th" \nd="@@"/>'
      ,"flags.u16th": '<path id="flags.u16th" \nd="@@"/>'
      ,"flags.u32nd": '<path id="flags.u32nd" \nd="@@"/>'
      ,"flags.u64th": '<path id="flags.u64th" \nd="@@"/>'
      ,"flags.ugrace": '<path id="flags.ugrace" \nd="@@"/>'
      ,"graceheads.quarter": '<g id="graceheads.quarter" transform="scale(0.6)" ><use xlink:href="#noteheads.quarter" /></g>'
      ,"graceflags.d8th": '<g id="graceflags.d8th" transform="scale(0.6)" ><use xlink:href="#flags.d8th" /></g>'
      ,"graceflags.u8th": '<g id="graceflags.u8th" transform="scale(0.6)" ><use xlink:href="#flags.u8th" /></g>'
      ,"noteheads.quarter": '<path id="noteheads.quarter" \nd="@@"/>'
      ,"noteheads.whole": '<path id="noteheads.whole" \nd="@@"/>'
      ,"notehesad.dbl": '<path id="noteheads.dbl" \nd="@@"/>'
      ,"noteheads.half": '<path id="noteheads.half" \nd="@@"/>'
      ,"rests.whole": '<path id="rests.whole" \nd="@@"/>'
      ,"rests.half": '<path id="rests.half" \nd="@@"/>'
      ,"rests.quarter": '<path id="rests.quarter" \nd="@@"/>'
      ,"rests.8th": '<path id="rests.8th" \nd="@@"/>'
      ,"rests.16th": '<path id="rests.16th" \nd="@@"/>'
      ,"rests.32nd": '<path id="rests.32nd" \nd="@@"/>'
      ,"rests.64th": '<path id="rests.64th" \nd="@@"/>'
      ,"rests.128th": '<path id="rests.128th" \nd="@@"/>'
      ,"scripts.rarrow": '<path id="scripts.rarrow" \nd="M -6 -5 h 8 v -3 l 4 4 l -4 4 v -3 h -8 z"/>'
      ,"scripts.tabrest": '<path id="scripts.tabrest" \nd="M -5 5 h 10 v 2 h -10 z"/>'
      ,"scripts.lbrace": '<path id="scripts.lbrace" \nd="@@"/>'
      ,"scripts.ufermata": '<path id="scripts.ufermata" \nd="@@"/>'
      ,"scripts.dfermata": '<path id="scripts.dfermata" \nd="@@"/>'
      ,"scripts.sforzato": '<path id="scripts.sforzato" \nd="@@"/>'
      ,"scripts.staccato": '<path id="scripts.staccato" \nd="@@"/>'
      ,"scripts.tenuto": '<path id="scripts.tenuto" \nd="@@"/>'
      ,"scripts.umarcato": '<path id="scripts.umarcato" \nd="@@"/>'
      ,"scripts.dmarcato": '<path id="scripts.dmarcato" \nd="@@"/>'
      ,"scripts.stopped": '<path id="scripts.stopped" \nd="@@"/>'
      ,"scripts.upbow": '<path id="scripts.upbow" \nd="@@"/>'
      ,"scripts.downbow": '<path id="scripts.downbow" \nd="@@"/>'
      ,"scripts.turn": '<path id="scripts.turn" \nd="@@"/>'
      ,"scripts.trill": '<path id="scripts.trill" \nd="@@"/>'
      ,"scripts.segno": '<path id="scripts.segno" transform="scale(0.8)" \nd="@@"/>'
      ,"scripts.coda": '<path id="scripts.coda" transform="scale(0.8)" \nd="@@"/>'
      ,"scripts.comma": '<path id="scripts.comma" \nd="@@"/>'
      ,"scripts.roll": '<path id="scripts.roll" \nd="@@"/>'
      ,"scripts.prall": '<path id="scripts.prall" \nd="@@"/>'
      ,"scripts.mordent": '<path id="scripts.mordent" \nd="@@"/>'
      ,"timesig.common": '<path id="timesig.common" \nd="@@"/>'
      ,"timesig.cut": '<path id="timesig.cut" \nd="@@"/>'
      ,"it.punto": '<path id="it.punto" \nd="@@"/>'
      ,"it.l": '<path id="it.l" \nd="@@"/>'
      ,"it.f": '<path id="it.f" \nd="@@"/>'
      ,"it.F": '<path id="it.F" \nd="@@"/>'
      ,"it.i": '<path id="it.i" \nd="@@"/>'
      ,"it.n": '<path id="it.n" \nd="@@"/>'
      ,"it.e": '<path id="it.e" \nd="@@"/>'
      ,"it.D": '<path id="it.D" \nd="@@"/>'
      ,"it.d": '<path id="it.d" \nd="@@"/>'
      ,"it.a": '<path id="it.a" \nd="@@"/>'
      ,"it.C": '<path id="it.C" \nd="@@"/>'
      ,"it.c": '<path id="it.c" \nd="@@"/>'
      ,"it.p": '<path id="it.p" \nd="@@"/>'
      ,"it.o": '<path id="it.o" \nd="@@"/>'
      ,"it.S": '<path id="it.S" \nd="@@"/>'
      ,"it.s": '<path id="it.s" \nd="@@"/>'
      ,"it.Fine": '<g id="it.Fine" ><use xlink:href="#it.F" x="0" y="3" /><use xlink:href="#it.i" x="12" y="3" /><use xlink:href="#it.n" x="17.5" y="3" /><use xlink:href="#it.e" x="27" y="3" /></g>'
      ,"it.Coda": '<g id="it.Coda" ><use xlink:href="#it.C" x="0" y="3" /><use xlink:href="#it.o" x="12" y="3" /><use xlink:href="#it.d" x="20" y="3" /><use xlink:href="#it.a" x="30" y="3" /></g>'
      ,"it.Da": '<g id="it.Da"><use xlink:href="#it.D" x="0" y="3" /><use xlink:href="#it.a" x="14" y="3" /></g>'
      ,"it.DaCoda": '<g id="it.DaCoda"><use xlink:href="#it.Da" x="0" y="0" /><use xlink:href="#scripts.coda" x="32" y="0" /></g>'
      ,"it.DaSegno": '<g id="it.DaSegno"><use xlink:href="#it.Da" x="0" y="0" /><use xlink:href="#scripts.segno" x="32" y="-3" /></g>'
      ,"it.DC": '<g id="it.DC"><use xlink:href="#it.D" x="0" y="1" /><use xlink:href="#it.punto" x="12" y="2" /><use xlink:href="#it.C" x="18" y="1" /><use xlink:href="#it.punto" x="29" y="2" /></g>'
      ,"it.DS": '<g id="it.DS"><use xlink:href="#it.D" x="0" y="1" /><use xlink:href="#it.punto" x="12" y="2" /><use xlink:href="#it.S" x="18" y="1" /><use xlink:href="#it.punto" x="29" y="2" /></g>'
      ,"it.al": '<g id="it.al"><use xlink:href="#it.a" x="0" y="2" /><use xlink:href="#it.l" x="10" y="2" /></g>'
      ,"it.DCalFine": '<g id="it.DCalFine"><use xlink:href="#it.DC" x="-14" y="1" /><use xlink:href="#it.al" x="25" y="1" /><use xlink:href="#it.Fine" x="46" y="-1" /></g>'
      ,"it.DCalCoda": '<g id="it.DCalCoda"><use xlink:href="#it.DC" x="-14" y="1" /><use xlink:href="#it.al" x="25" y="1" /><use xlink:href="#it.Coda" x="46" y="-1" /></g>'
      ,"it.DSalFine": '<g id="it.DSalFine"><use xlink:href="#it.DS" x="-14" y="1" /><use xlink:href="#it.al" x="25" y="1" /><use xlink:href="#it.Fine" x="46" y="-1" /></g>'
      ,"it.DSalCoda": '<g id="it.DSalCoda"><use xlink:href="#it.DS" x="-14" y="1" /><use xlink:href="#it.al" x="25" y="1" /><use xlink:href="#it.Coda" x="46" y="-1" /></g>'
    };
    
    this.getDefinition = function (gl) {
        
        
        var g = glyphs[gl];
        
        if (!g) {
            return "";
        }
        
        // expande path se houver, buscando a definicao do original do ABCJS.
        g = g.replace('@@', abc_glyphs.getSymbolPathTxt(gl) );
        
        var i = 0, j = 0;

        while (i>=0) {
            i = g.indexOf('xlink:href="#', j );
            if (i < 0) continue;
            i += 13;
            j = g.indexOf('"', i);
            g += this.getDefinition(g.slice(i, j));
        }

        return '\n' +  g;
    };
};
