use LWP::Simple;
use feature 'unicode_strings';
use utf8;
use Encode;
use Mojo::DOM;
use Mojo::Collection;
use DateTime;
binmode(STDOUT, ":utf8");

my $date = $ARGV[0];
my $url = getUrl();
my $html = get("$url");
my $dom = Mojo::DOM->new($html);

my $json = "[";
my $count = 0;

my $ul = $dom->find('ul[class~="type13"]')->first;

for my $li ($ul->find('li')->each) {
  for my $dt ($li->find('dt')->each) {
    next if $dt->attr('class') =~ "photo";

    my $a = $dt->find('a')->first;

    my $href = $a->attr('href');
    $href =~ s/https:\/\/news.naver.com\/main//;

    my $title = $a->all_text;
    $title =~ s/[\'\"]/`/g;

    $json .= "," if $count++;
    $json .= "{\"href\": \"$href\", \"title\": \"$title\"}";

    last;
  }
}

$json .= "]";
print $json;

sub getUrl
{
  $date =~ /^(.{4})(.{2})(.{2})/;
  return "http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=023&listType=paper&date=$date";
}
