(async () => {
  const status = document.getElementById('download-status');
  const params = new URLSearchParams(location.search);
  const requested = params.get('platform');
  const detected = /Windows/i.test(navigator.userAgent) ? 'windows'
    : /Mac/i.test(navigator.userAgent) ? 'mac'
      : /Linux/i.test(navigator.userAgent) ? 'linux' : '';
  const platform = requested || detected;

  const patterns = {
    windows: /_x64-setup\.exe$/,
    'mac-arm': /_aarch64\.dmg$/,
    'mac-intel': /_x64\.dmg$/,
    mac: /Mac.*ARM|AppleWebKit.*Mobile/i.test(navigator.userAgent) ? /_aarch64\.dmg$/ : /_x64\.dmg$/,
    linux: /_amd64\.AppImage$/,
    deb: /_amd64\.deb$/,
    rpm: /\.x86_64\.rpm$/,
  };

  try {
    if (!patterns[platform]) throw new Error('Choose a supported platform from the download page.');
    const releases = await fetch('https://api.github.com/repos/Bakobiibizo/harbor/releases?per_page=20', { cache: 'no-store' });
    if (!releases.ok) throw new Error('Latest release assets are unavailable.');
    const published = await releases.json();
    const data = published.find(({ draft, tag_name, assets }) =>
      !draft && tag_name !== 'updater-channel' && assets.some(({ name }) => patterns[platform].test(name))
    );
    if (!data) throw new Error(`No published ${platform} build is currently available.`);
    const version = data.tag_name.replace(/^v/, '');
    const asset = data.assets.find(({ name }) => patterns[platform].test(name));
    if (!asset) throw new Error(`No ${platform} build is available in Harbor ${version}.`);
    status.textContent = `Downloading Harbor ${version} for ${platform}…`;
    document.getElementById('release-link').href = data.html_url;
    location.replace(asset.browser_download_url);
  } catch (error) {
    status.textContent = error.message;
  }
})();
