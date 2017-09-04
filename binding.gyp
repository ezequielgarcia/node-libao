{
  'targets': [
    {
      'target_name': 'binding',
      'sources': [
        'src/binding.cc',
      ],
      'include_dirs' : [
        '<!(node -e "require(\'nan\')")',
        '<!@(pkg-config --cflags-only-I ao | sed s/-I//g)'
      ],
      'ldflags': [
        '<!@(pkg-config --libs-only-L ao)'
      ],
      'libraries': [
        '<!@(pkg-config --libs-only-l ao)'
      ]
    }
  ]
}
